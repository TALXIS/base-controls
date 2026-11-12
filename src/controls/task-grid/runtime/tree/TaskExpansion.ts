import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { GridApi, IRowNode, RowGroupOpenedEvent } from "ag-grid-community";
import type { IEventSubscriber } from "@core";
import type { ITaskDataProvider } from "../provider";
import { listenToGridApi } from "@controls/grid";

/** One change to which tasks are expanded. */
export interface ITaskExpansionDelta {
    recordIds: string[];
    expanded: boolean;
}

export interface ITaskExpansionEvents {
    onExpansionChanged: (delta: ITaskExpansionDelta) => void;
}

/** Which tasks are expanded, for every surface that draws the tree. */
export interface ITaskExpansion {
    readonly events: IEventSubscriber<ITaskExpansionEvents>;
    /** Whether the row is drawn expanded. */
    isExpanded(recordId: string): boolean;
    setExpanded(recordId: string, expanded: boolean): void;
    toggle(recordId: string): void;
    /** Expands the shallowest collapsed tasks on display. */
    expandLevel(): void;
    /** Collapses the deepest expanded tasks on display. */
    collapseLevel(): void;
    canExpandLevel(): boolean;
    canCollapseLevel(): boolean;
    getExpandedIds(): string[];
}

export interface ITaskExpansionParameters {
    provider: ITaskDataProvider;
    /** What the view saved; without it, tasks open by `defaultExpandedLevel`. */
    expandedIds?: string[];
    /** How many levels open themselves, `-1` for none. */
    defaultExpandedLevel: number;
    isFlatList: () => boolean;
    onExpandedIdsChanged: (expandedIds: string[]) => void;
}

interface IDisplayedParent {
    recordId: string;
    level: number;
    isExpanded: boolean;
}

export class TaskExpansion implements ITaskExpansion {
    private _provider: ITaskDataProvider;
    private _isFlatList: () => boolean;
    private _onExpandedIdsChanged: (expandedIds: string[]) => void;
    private _intent = new Map<string, boolean>();
    //until the user changes the expansion
    private _defaultExpandedLevel?: number;
    private _gridApi?: GridApi<IRecord>;
    private _isApplying = false;
    private _isReporting = false;
    //the search and filters the shown rows were last opened for
    private _matchingKey?: string;
    //the parents a match held open then
    private _heldOpenIds = new Set<string>();
    public readonly events = new EventEmitter<ITaskExpansionEvents>();

    constructor(parameters: ITaskExpansionParameters) {
        this._provider = parameters.provider;
        this._isFlatList = parameters.isFlatList;
        this._onExpandedIdsChanged = parameters.onExpandedIdsChanged;
        if (!parameters.expandedIds) {
            this._defaultExpandedLevel = parameters.defaultExpandedLevel;
        }
        for (const recordId of parameters.expandedIds ?? []) {
            this._intent.set(recordId, true);
        }
    }

    /** Keeps AG Grid's expanded rows in step with this. */
    /** @returns Detaches from `gridApi`. */
    public attach(gridApi: GridApi<IRecord>): () => void {
        this._gridApi = gridApi;
        this._matchingKey = this._getMatchingKey();
        this._heldOpenIds = this._getHeldOpenIds();
        const stop = listenToGridApi(gridApi, { rowGroupOpened: this._onRowGroupOpened, rowDataUpdated: this._onRowDataUpdated });
        return () => {
            stop();
            if (this._gridApi === gridApi) {
                this._gridApi = undefined;
            }
        };
    }

    public isExpanded(recordId: string): boolean {
        if (this._isFlatList()) {
            return false;
        }
        const view = this._provider.getRecordTree().view;
        //shown only because something under it matched
        if (view.getOrderedIds().length > 0 && !view.isMatching(recordId) && view.hasChildren(recordId)) {
            return true;
        }
        return this._intent.get(recordId) ?? this._isOpenByDefault(recordId);
    }

    public setExpanded(recordId: string, expanded: boolean): void {
        const isShownExpanded = this._isShownExpanded(recordId);
        if (this._intent.get(recordId) === expanded && (isShownExpanded === undefined || isShownExpanded === expanded)) {
            return;
        }
        this._intent.set(recordId, expanded);
        this._store();
        this._apply({ recordIds: [recordId], expanded });
    }

    //flips what the row shows, even for a parent kept open for its matches
    public toggle(recordId: string): void {
        this.setExpanded(recordId, !(this._isShownExpanded(recordId) ?? this.isExpanded(recordId)));
    }

    public expandLevel(): void {
        const collapsed = this._getDisplayedParents().filter(parent => !parent.isExpanded);
        const level = Math.min(...collapsed.map(parent => parent.level));
        this._change(collapsed.filter(parent => parent.level === level).map(parent => parent.recordId), true);
    }

    public collapseLevel(): void {
        const expanded = this._getDisplayedParents().filter(parent => parent.isExpanded);
        const level = Math.max(...expanded.map(parent => parent.level));
        this._change(expanded.filter(parent => parent.level === level).map(parent => parent.recordId), false);
    }

    public canExpandLevel(): boolean {
        return this._getDisplayedParents().some(parent => !parent.isExpanded);
    }

    public canCollapseLevel(): boolean {
        return this._getDisplayedParents().some(parent => parent.isExpanded);
    }

    public getExpandedIds(): string[] {
        return [...this._intent].filter(([, expanded]) => expanded).map(([recordId]) => recordId);
    }

    /** Forgets tasks that are gone. */
    public prune(): void {
        const recordsMap = this._provider.getRecordsMap();
        const goneIds = [...this._intent.keys()].filter(recordId => !recordsMap[recordId]);
        if (goneIds.length > 0) {
            goneIds.forEach(recordId => this._intent.delete(recordId));
            this._store();
        }
    }

    private _change(recordIds: string[], expanded: boolean): void {
        if (recordIds.length === 0) {
            return;
        }
        recordIds.forEach(recordId => this._intent.set(recordId, expanded));
        this._store();
        this._apply({ recordIds, expanded });
    }

    private _getDisplayedParents(): IDisplayedParent[] {
        const parents: IDisplayedParent[] = [];
        if (this._isFlatList()) {
            return parents;
        }
        const view = this._provider.getRecordTree().view;
        const visit = (parentId: string | null, level: number): void => {
            for (const child of view.getChildren(parentId)) {
                const recordId = child.getRecordId();
                if (!view.hasChildren(recordId)) {
                    continue;
                }
                const isExpanded = this.isExpanded(recordId);
                parents.push({ recordId, level, isExpanded });
                if (isExpanded) {
                    visit(recordId, level + 1);
                }
            }
        };
        visit(null, 0);
        return parents;
    }

    private _apply(delta: ITaskExpansionDelta): void {
        this.events.dispatchEvent('onExpansionChanged', delta);
        //a row the user opened in the grid is already in that state
        if (this._isReporting || !this._gridApi) {
            return;
        }
        this._isApplying = true;
        try {
            this._setNodesExpanded(this._gridApi, new Set(delta.recordIds), delta.expanded);
            this._gridApi.onGroupExpandedOrCollapsed();
        }
        finally {
            this._isApplying = false;
        }
    }

    private _isShownExpanded(recordId: string): boolean | undefined {
        return this._gridApi?.getRowNode(recordId)?.expanded;
    }

    //a lookup by id walks every row
    private _setNodesExpanded(gridApi: GridApi<IRecord>, recordIds: Set<string>, expanded: boolean): void {
        const nodes: IRowNode<IRecord>[] = [];
        gridApi.forEachNode(node => {
            if (node.id && recordIds.has(node.id) && node.expanded !== expanded) {
                nodes.push(node);
            }
        });
        nodes.forEach(node => node.setExpanded(expanded));
    }

    //AG Grid reports what this set too, after it is done
    private _onRowGroupOpened = (event: RowGroupOpenedEvent<IRecord>): void => {
        if (this._isApplying || !event.node.id || !!event.expanded === this.isExpanded(event.node.id)) {
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

    private _isOpenByDefault(recordId: string): boolean {
        return this._defaultExpandedLevel !== undefined && this._provider.getRecordTree().view.getPath(recordId).length - 1 <= this._defaultExpandedLevel;
    }

    //AG Grid asks isExpanded only of the rows it creates
    private _onRowDataUpdated = (): void => {
        const matchingKey = this._getMatchingKey();
        if (!this._gridApi || matchingKey === this._matchingKey) {
            return;
        }
        this._matchingKey = matchingKey;
        const heldOpenIds = this._getHeldOpenIds();
        const candidateIds = new Set([...heldOpenIds, ...this._heldOpenIds]);
        this._heldOpenIds = heldOpenIds;
        const gridApi = this._gridApi;
        const changed = [...candidateIds].map(recordId => gridApi.getRowNode(recordId)).filter((node): node is IRowNode<IRecord> => !!node?.id && node.group === true && node.expanded !== this.isExpanded(node.id));
        if (changed.length === 0) {
            return;
        }
        this._isApplying = true;
        try {
            changed.forEach(node => node.setExpanded(!node.expanded));
            this._gridApi.onGroupExpandedOrCollapsed();
        }
        finally {
            this._isApplying = false;
        }
    };

    private _getHeldOpenIds(): Set<string> {
        const view = this._provider.getRecordTree().view;
        return new Set(view.getOrderedIds().filter(recordId => !view.isMatching(recordId) && view.hasChildren(recordId)));
    }

    private _getMatchingKey(): string {
        return JSON.stringify([this._provider.getSearchQuery(), this._provider.getFiltering()]);
    }

    //what the default level opened is saved with the user's change
    private _store(): void {
        if (this._defaultExpandedLevel !== undefined) {
            const view = this._provider.getRecordTree().view;
            view.getOrderedIds().filter(recordId => !this._intent.has(recordId) && view.hasChildren(recordId) && this._isOpenByDefault(recordId)).forEach(recordId => this._intent.set(recordId, true));
            this._defaultExpandedLevel = undefined;
        }
        this._onExpandedIdsChanged(this.getExpandedIds());
    }
}
