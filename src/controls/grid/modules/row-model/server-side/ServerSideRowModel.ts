import { GridApi } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModel } from "../interfaces";
import { ServerSideDatasource } from "./ServerSideDatasource";

export interface IServerSideRowModelParameters {
    services: IGridServiceLocator;
}

/** Rows read a level at a time, through a datasource. */
export class ServerSideRowModel implements IGridRowModel {
    private _services: IGridServiceLocator;
    private _datasource: ServerSideDatasource;

    constructor(parameters: IServerSideRowModelParameters) {
        this._services = parameters.services;
        this._datasource = new ServerSideDatasource(this._services);
    }

    public getInitialComponentProps(): Partial<AgGridReactProps<IRecord>> {
        return { rowModelType: 'serverSide' };
    }

    public applyGridOptions(gridApi: GridApi<IRecord>): void {
        gridApi.setGridOption('serverSideDatasource', this._datasource);
        //asked of the grouping module, because a group row is one of its
        gridApi.setGridOption('isServerSideGroupOpenByDefault', params =>
            this._services.find('grouping')?.isGroupOpenByDefault(params.rowNode) ?? false);
    }

    public refresh(gridApi: GridApi<IRecord>): void {
        //purged rather than reloaded in place
        this._services.find('grouping')?.captureExpandedRowGroupIds(
            gridApi.getState()?.rowGroupExpansion?.expandedRowGroupIds ?? []);
        gridApi.refreshServerSide({ purge: true });
    }

    /**
     * Nothing to do: an expanded node asks the datasource for its children.
     */
    public applyExpansionChange(): void { }

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
