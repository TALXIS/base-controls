import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { GridApi, IRowNode, RowGroupOpenedEvent } from "ag-grid-community";
import type { IEventSubscriber } from "@core";
import type { ITaskDataProvider } from "../provider";

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
    expandedIds: string[];
    onIsFlatList: () => boolean;
    onExpandedIdsChanged: (expandedIds: string[]) => void;
}

interface IDisplayedParent {
    recordId: string;
    level: number;
    isExpanded: boolean;
}

export class TaskExpansion implements ITaskExpansion {
    private _provider: ITaskDataProvider;
    private _onIsFlatList: () => boolean;
    private _onExpandedIdsChanged: (expandedIds: string[]) => void;
    private _intent = new Map<string, boolean>();
    private _gridApi?: GridApi<IRecord>;
    private _isApplying = false;
    private _isReporting = false;
    public readonly events = new EventEmitter<ITaskExpansionEvents>();

    constructor(parameters: ITaskExpansionParameters) {
        this._provider = parameters.provider;
        this._onIsFlatList = parameters.onIsFlatList;
        this._onExpandedIdsChanged = parameters.onExpandedIdsChanged;
        for (const recordId of parameters.expandedIds) {
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
        this._apply({ recordIds, expanded });
    }

    private _getDisplayedParents(): IDisplayedParent[] {
        const parents: IDisplayedParent[] = [];
        if (this._onIsFlatList()) {
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

    private _store(): void {
        this._onExpandedIdsChanged(this.getExpandedIds());
    }
}
