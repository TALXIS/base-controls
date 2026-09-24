import { GridApi } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModel, IGridRowModelGroupingParameters } from "../interfaces";
import { ServerSideDatasource } from "./ServerSideDatasource";
import { ServerSideRowModelGrouping } from "./ServerSideRowModelGrouping";

export interface IServerSideRowModelParameters {
    services: IGridServiceLocator;
}

/** Rows read a level at a time, through a datasource. */
export class ServerSideRowModel implements IGridRowModel {
    private _services: IGridServiceLocator;
    private _datasource: ServerSideDatasource;
    private _grouping?: ServerSideRowModelGrouping;

    constructor(parameters: IServerSideRowModelParameters) {
        this._services = parameters.services;
        this._services.get('grid').registerAgGridProps(result => result.props.rowModelType = 'serverSide');
        this._datasource = new ServerSideDatasource(this._services);
    }

    public applyGridOptions(gridApi: GridApi<IRecord>): void {
        gridApi.setGridOption('serverSideDatasource', this._datasource);
        gridApi.setGridOption('isServerSideGroupOpenByDefault', params => this._grouping?.isGroupOpenByDefault(params.rowNode) ?? false);
    }

    public refresh(gridApi: GridApi<IRecord>): void {
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
}
