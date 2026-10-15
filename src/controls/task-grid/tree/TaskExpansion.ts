import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { GridApi, IRowNode, RowGroupOpenedEvent } from "ag-grid-community";
import type { IEventSubscriber, IStateStore } from "@utils";
import type { ITaskDataProvider } from "../provider";

/** One change to which tasks are expanded. */
export interface ITaskExpansionDelta {
    recordIds: string[];
    expanded: boolean;
    /** Whether it covers the whole tree rather than one row. */
    isBulk: boolean;
}

export interface ITaskExpansionEvents {
    onExpansionChanged: (delta: ITaskExpansionDelta) => void;
}

/** Which tasks are expanded; every surface draws what this says and reports what the user did. */
export interface ITaskExpansion {
    readonly events: IEventSubscriber<ITaskExpansionEvents>;
    /** Whether the row is drawn expanded: never in a flat list, always for an unmatched ancestor of a match. */
    isExpanded(recordId: string): boolean;
    setExpanded(recordId: string, expanded: boolean): void;
    toggle(recordId: string): void;
    expandAll(): void;
    collapseAll(): void;
    getExpandedIds(): string[];
}

/** What a task grid keeps of its tree per view. */
export interface ITaskTreeState {
    expandedIds?: string[];
    isFlatList?: boolean;
}

export interface ITaskExpansionParameters {
    provider: ITaskDataProvider;
    state: IStateStore;
    onIsFlatList: () => boolean;
}

export const TASK_TREE_STATE_KEY = 'taskTree';

export class TaskExpansion implements ITaskExpansion {
    private _provider: ITaskDataProvider;
    private _state: IStateStore;
    private _onIsFlatList: () => boolean;
    private _intent = new Map<string, boolean>();
    private _gridApi?: GridApi<IRecord>;
    private _isApplying = false;
    private _isReporting = false;
    public readonly events = new EventEmitter<ITaskExpansionEvents>();

    constructor(parameters: ITaskExpansionParameters) {
        this._provider = parameters.provider;
        this._state = parameters.state;
        this._onIsFlatList = parameters.onIsFlatList;
        for (const recordId of this._getState().expandedIds ?? []) {
            this._intent.set(recordId, true);
        }
    }

    /** Keeps AG Grid's expanded rows in step with this. */
    public attach(gridApi: GridApi<IRecord>): void {
        this._gridApi = gridApi;
        gridApi.addEventListener('rowGroupOpened', this._onRowGroupOpened);
    }

    public isExpanded(recordId: string): boolean {
        if (this._onIsFlatList()) {
            return false;
        }
        const view = this._provider.getRecordTree().view;
        //shown only because something under it matched
        if (view.getOrderedIds().length > 0 && !view.isMatching(recordId) && view.hasChildren(recordId)) {
            return true;
        }
        return this._intent.get(recordId) ?? false;
    }

    public setExpanded(recordId: string, expanded: boolean): void {
        if (this._intent.get(recordId) === expanded) {
            return;
        }
        this._intent.set(recordId, expanded);
        this._store();
        this._apply({ recordIds: [recordId], expanded, isBulk: false });
    }

    public toggle(recordId: string): void {
        this.setExpanded(recordId, !this.isExpanded(recordId));
    }

    public expandAll(): void {
        if (this._onIsFlatList()) {
            return;
        }
        const view = this._provider.getRecordTree().view;
        this._change(view.getOrderedIds().filter(recordId => view.hasChildren(recordId) && this._intent.get(recordId) !== true), true);
    }

    public collapseAll(): void {
        this._change(this.getExpandedIds(), false);
    }

    public getExpandedIds(): string[] {
        return [...this._intent].filter(([, expanded]) => expanded).map(([recordId]) => recordId);
    }

    /** Forgets tasks that are gone. */
    public prune(): void {
        const recordsMap = this._provider.getRecordsMap();
        for (const recordId of [...this._intent.keys()]) {
            if (!recordsMap[recordId]) {
                this._intent.delete(recordId);
            }
        }
        this._store();
    }

    private _change(recordIds: string[], expanded: boolean): void {
        if (recordIds.length === 0) {
            return;
        }
        recordIds.forEach(recordId => this._intent.set(recordId, expanded));
        this._store();
        this._apply({ recordIds, expanded, isBulk: true });
    }

    private _apply(delta: ITaskExpansionDelta): void {
        this.events.dispatchEvent('onExpansionChanged', delta);
        //a row the user opened in the grid is already in that state
        if (this._isReporting || !this._gridApi) {
            return;
        }
        this._isApplying = true;
        try {
            if (delta.isBulk) {
                delta.expanded ? this._gridApi.expandAll() : this._gridApi.collapseAll();
                return;
            }
            this._setNodesExpanded(this._gridApi, new Set(delta.recordIds), delta.expanded);
            this._gridApi.onGroupExpandedOrCollapsed();
        }
        finally {
            this._isApplying = false;
        }
    }

    //one walk of the rows: a lookup by id walks them all
    private _setNodesExpanded(gridApi: GridApi<IRecord>, recordIds: Set<string>, expanded: boolean): void {
        const nodes: IRowNode<IRecord>[] = [];
        gridApi.forEachNode(node => {
            if (node.id && recordIds.has(node.id) && node.expanded !== expanded) {
                nodes.push(node);
            }
        });
        nodes.forEach(node => node.setExpanded(expanded));
    }

    private _onRowGroupOpened = (event: RowGroupOpenedEvent<IRecord>): void => {
        if (this._isApplying || !event.node.id) {
            return;
        }
        this._isReporting = true;
        try {
            this.setExpanded(event.node.id, !!event.expanded);
        }
        finally {
            this._isReporting = false;
        }
    };

    private _getState(): ITaskTreeState {
        return this._state.get<ITaskTreeState>(TASK_TREE_STATE_KEY) ?? {};
    }

    private _store(): void {
        this._state.set<ITaskTreeState>(TASK_TREE_STATE_KEY, { ...this._getState(), expandedIds: this.getExpandedIds() });
    }
}
