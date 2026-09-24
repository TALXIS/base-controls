import { GridApi, IsServerSideGroupOpenByDefaultParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModel, IGridRowModelGroupingParameters, IGridRowModelType } from "../interfaces";
import { ServerSideDatasource } from "./ServerSideDatasource";
import { ServerSideRowModelGrouping } from "./ServerSideRowModelGrouping";
import { IGridAgGridOptions } from "../../../services/runtime";
import { GRID_MODULE_PRIORITY } from "../../priorities";

export interface IServerSideRowModelParameters {
    services: IGridServiceLocator;
}

/** Rows read a level at a time, through a datasource. */
export class ServerSideRowModel implements IGridRowModel {
    private _services: IGridServiceLocator;
    private _datasource: ServerSideDatasource;
    private _grouping?: ServerSideRowModelGrouping;
    public readonly type: IGridRowModelType = 'serverSide';

    constructor(parameters: IServerSideRowModelParameters) {
        this._services = parameters.services;
        this._datasource = new ServerSideDatasource(this._services);
        this._services.get('grid').registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.rowModel);
    }

    public refresh(): void {
        const gridApi = this._services.get('gridApi');
        //purged rather than reloaded in place
        this._grouping?.captureExpandedIds(gridApi.getState()?.rowGroupExpansion?.expandedRowGroupIds ?? []);
        gridApi.refreshServerSide({ purge: true });
    }

    public createGrouping(parameters: IGridRowModelGroupingParameters): ServerSideRowModelGrouping {
        this._grouping = new ServerSideRowModelGrouping(parameters);
        return this._grouping;
    }

    /** Read off the selection state rather than the nodes. */
    public getSelectedRecordIds(gridApi: GridApi<IRecord>): string[] {
        const toggledNodes: unknown = gridApi.getServerSideSelectionState()?.toggledNodes;
        if (!Array.isArray(toggledNodes)) {
            return [];
        }
        return toggledNodes.filter((node): node is string => typeof node === 'string');
    }

    public setSelectedRecordIds(gridApi: GridApi<IRecord>, recordIds: string[]): void {
        gridApi.setServerSideSelectionState({
            selectAll: false,
            toggledNodes: recordIds,
        });
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.serverSideDatasource = this._datasource;
        result.options.isServerSideGroupOpenByDefault = this._isGroupOpenByDefault;
        this._grouping?.onAgGridOptions();
    };

    private _isGroupOpenByDefault = (params: IsServerSideGroupOpenByDefaultParams): boolean => this._grouping?.isGroupOpenByDefault(params.rowNode) ?? false;
}
