import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { ITaskDataProvider } from "../task";

/** What the module's state slice is stored under. Part of what a session carries, so it is fixed. */
export const TASK_EXPANSION_STATE_KEY = 'expansion';

/** One change to what is expanded, as the two halves of the split view receive it. */
export interface ITaskExpansionDelta {
    /** The records whose expansion changed. Never empty. */
    recordIds: string[];
    /** What they changed to — one change is one direction. */
    expanded: boolean;
    /**
     * Whether the change covers the tree rather than a row the user pointed at. A surface may then
     * redraw wholesale instead of row by row.
     */
    isBulk: boolean;
}

export interface ITaskExpansionEvents {
    /**
     * Raised once per change, after it is recorded — once for a change covering ten thousand rows too.
     * Nothing here may fan out per row: making a bulk change cost one repaint is the point of it.
     */
    onExpansionChanged: (delta: ITaskExpansionDelta) => void;
}

/** What a session remembers about expansion. */
export interface ITaskExpansionState {
    /** The records the user left expanded. */
    expandedIds?: string[];
}

/**
 * Which task rows are expanded.
 *
 * The one authority: the grid and the timeline report what the user did here and draw what comes back,
 * and neither reads the other. Before this, each surface kept its own record and they were reconciled
 * pairwise, which is why they could disagree.
 *
 * What is stored is *intent* — a row the user has never touched has none, which is what lets a surface
 * apply its own default to it. {@link ITaskExpansionProvider.shouldRenderExpanded} is what a surface
 * should draw; the raw intent is not the same answer.
 */
export interface ITaskExpansionProvider {
    events: IEventEmitter<ITaskExpansionEvents>;
    /** What the user last did to this row, or nothing if they never touched it. */
    getIntent: (recordId: string) => boolean | undefined;
    /**
     * Whether the row should be drawn expanded — the single rule, which both surfaces read.
     *
     * A flat list has no expansion at all. A row the filter or the quick find did not match is drawn open
     * because a descendant of it is the only reason the row is there. Otherwise the user's intent decides.
     *
     * @param onGetFallback What to answer for a row with no intent. The grid passes its own
     * default-expanded-level rule, so a host that configures one still gets it.
     */
    shouldRenderExpanded: (recordId: string, onGetFallback?: (recordId: string) => boolean) => boolean;
    /** Records a row as expanded or collapsed. A change to what is already stored raises nothing. */
    setExpanded: (recordId: string, expanded: boolean) => void;
    /** Flips the row. */
    toggle: (recordId: string) => void;
    /** Expands every row that has children, as one change. Does nothing to a flat list. */
    expandAll: () => void;
    /** Collapses every row that is expanded, as one change. */
    collapseAll: () => void;
    /** Every row currently intended expanded. */
    getExpandedIds: () => string[];
    /** Forgets rows that are no longer loaded. Called whenever the hierarchy is rebuilt. */
    prune: () => void;
}

export interface ITaskExpansionParameters {
    /** Where the records, the hierarchy and the session's state are reached. */
    services: ITaskGridServiceLocator;
}

/** Holds {@link ITaskExpansionProvider}. Built by the factory, before the first load. */
export class TaskExpansionProvider implements ITaskExpansionProvider {
    public readonly events: IEventEmitter<ITaskExpansionEvents> = new EventEmitter<ITaskExpansionEvents>();
    private _services: ITaskGridServiceLocator;
    private _intent: Map<string, boolean> = new Map();

    constructor(parameters: ITaskExpansionParameters) {
        this._services = parameters.services;
        for (const recordId of this._state.get().expandedIds ?? []) {
            this._intent.set(recordId, true);
        }
    }

    public getIntent(recordId: string): boolean | undefined {
        return this._intent.get(recordId);
    }

    public shouldRenderExpanded(recordId: string, onGetFallback?: (recordId: string) => boolean): boolean {
        const provider = this._taskDataProvider;
        if (provider.isFlatListEnabled()) {
            return false;
        }
        const view = provider.getRecordTree().view;
        //a row the view renders but the filter did not match is only there because a descendant of it
        //matched, so it opens to show that descendant. Asked of a row the view does not render - one
        //filtered out, or any row at all before the hierarchy is built - the answer is no opinion:
        //"nothing matches yet" must not read as "everything is expanded"
        if (view.getPosition(recordId) >= 0 && !view.isMatching(recordId)) {
            return true;
        }
        return this._intent.get(recordId) ?? onGetFallback?.(recordId) ?? false;
    }

    public setExpanded(recordId: string, expanded: boolean): void {
        if (this._intent.get(recordId) === expanded) {
            return;
        }
        this._intent.set(recordId, expanded);
        this._store();
        this.events.dispatchEvent('onExpansionChanged', { recordIds: [recordId], expanded, isBulk: false });
    }

    public toggle(recordId: string): void {
        this.setExpanded(recordId, !this.shouldRenderExpanded(recordId));
    }

    public expandAll(): void {
        const provider = this._taskDataProvider;
        if (provider.isFlatListEnabled()) {
            return;
        }
        const view = provider.getRecordTree().view;
        //every row with children, not only the ones a surface happens to have drawn: a surface that only
        //knows about the rows it has built cannot expand the ones it has not
        const recordIds = view.getOrderedIds().filter(recordId =>
            view.hasChildren(recordId) && this._intent.get(recordId) !== true);
        this._change(recordIds, true);
    }

    public collapseAll(): void {
        const recordIds = [...this._intent].filter(([, expanded]) => expanded).map(([recordId]) => recordId);
        this._change(recordIds, false);
    }

    public getExpandedIds(): string[] {
        return [...this._intent].filter(([, expanded]) => expanded).map(([recordId]) => recordId);
    }

    public prune(): void {
        const records = this._taskDataProvider.getRecordsMap();
        for (const recordId of [...this._intent.keys()]) {
            if (!records[recordId]) {
                this._intent.delete(recordId);
            }
        }
        this._store();
    }

    private _change(recordIds: string[], expanded: boolean): void {
        if (!recordIds.length) {
            return;
        }
        for (const recordId of recordIds) {
            this._intent.set(recordId, expanded);
        }
        this._store();
        this.events.dispatchEvent('onExpansionChanged', { recordIds, expanded, isBulk: true });
    }

    //a collapsed row is stored as a collapsed intent rather than as an absence, so a host's default
    //expanded level cannot quietly reopen what the user closed
    private _store(): void {
        this._state.set({ expandedIds: this.getExpandedIds() });
    }

    private get _state() {
        return this._services.get('taskGridState').module<ITaskExpansionState>(TASK_EXPANSION_STATE_KEY, 'session');
    }

    private get _taskDataProvider(): ITaskDataProvider {
        return this._services.get('taskDataProvider');
    }
}
