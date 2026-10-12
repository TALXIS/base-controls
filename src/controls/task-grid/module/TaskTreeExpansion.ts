import { GridApi, IRowNode, IsGroupOpenByDefaultParams, RowGroupOpenedEvent } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { GRID_MODULE_PRIORITY, IGridAgGridOptions, IGridRuntime } from "@controls/grid";
import { ITaskExpansionDelta, ITaskExpansionProvider } from "@controls/task-grid/providers/expansion";
import { ITaskTreeServiceMap } from "./GridTaskTree";

export interface ITaskTreeExpansionParameters {
    runtime: IGridRuntime<ITaskTreeServiceMap>;
}

/** Keeps the grid's expanded rows and the task grid's expansion in step. */
export class TaskTreeExpansion {
    private _runtime: IGridRuntime<ITaskTreeServiceMap>;
    private _isApplying = false;
    private _isReporting = false;

    constructor(parameters: ITaskTreeExpansionParameters) {
        this._runtime = parameters.runtime;
        //after the row model, which answers it for grouping
        this._runtime.registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.rowModel + 1);
        this._runtime.services.whenAvailable('gridApi', this._onGridApiAvailable);
        this._runtime.events.addEventListener('onDestroyed', this._onDestroyed);
    }

    private get _expansion(): ITaskExpansionProvider {
        return this._runtime.services.get('taskGrid').get('taskExpansion');
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._runtime.services.get('gridApi');
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.isGroupOpenByDefault = this._isGroupOpenByDefault;
    };

    private _isGroupOpenByDefault = (params: IsGroupOpenByDefaultParams<IRecord>): boolean => {
        return !!params.rowNode.data && this._expansion.shouldRenderExpanded(params.rowNode.data.getRecordId());
    };

    private _onGridApiAvailable = (gridApi: GridApi<IRecord>): void => {
        gridApi.addEventListener('rowGroupOpened', this._onRowGroupOpened);
        this._expansion.events.addEventListener('onExpansionChanged', this._onExpansionChanged);
    };

    //the expansion outlives the grid
    private _onDestroyed = (): void => {
        this._expansion.events.removeEventListener('onExpansionChanged', this._onExpansionChanged);
    };

    private _onRowGroupOpened = (event: RowGroupOpenedEvent<IRecord>): void => {
        if (this._isApplying || !event.node.id) {
            return;
        }
        //the row is already in the state being reported
        this._isReporting = true;
        try {
            this._expansion.setExpanded(event.node.id, !!event.expanded);
        }
        finally {
            this._isReporting = false;
        }
    };

    private _onExpansionChanged = (delta: ITaskExpansionDelta): void => {
        if (this._isReporting) {
            return;
        }
        this._isApplying = true;
        try {
            if (delta.isBulk) {
                delta.expanded ? this._gridApi.expandAll() : this._gridApi.collapseAll();
                return;
            }
            this._setNodesExpanded(new Set(delta.recordIds), delta.expanded);
        }
        finally {
            this._isApplying = false;
        }
    };

    //one walk of the rows: a lookup by id walks all of them
    private _setNodesExpanded(recordIds: Set<string>, expanded: boolean): void {
        const nodes: IRowNode<IRecord>[] = [];
        this._gridApi.forEachNode(node => {
            if (node.id && recordIds.has(node.id) && node.expanded !== expanded) {
                nodes.push(node);
            }
        });
        //synchronously, so whoever asked can reach the rows it reveals straight away
        for (const node of nodes) {
            this._gridApi.setRowNodeExpanded(node, expanded, false, true);
        }
    }
}
