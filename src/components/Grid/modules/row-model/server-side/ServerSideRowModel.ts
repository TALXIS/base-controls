import { GridApi } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModel } from "../interfaces";
import { ServerSideDatasource } from "./ServerSideDatasource";

export interface IServerSideRowModelParameters {
    services: IGridServiceLocator;
}

/**
 * Rows read a level at a time, through a datasource.
 *
 * What a grid over a dataset it pages wants: only the levels the user has opened are ever asked for.
 */
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
        //asked of the grouping module, because a group row is one of its: a grid without it has none, and
        //nothing to open
        gridApi.setGridOption('isServerSideGroupOpenByDefault', params =>
            this._services.find('grouping')?.isGroupOpenByDefault(params.rowNode) ?? false);
    }

    public refresh(gridApi: GridApi<IRecord>): void {
        //purged rather than reloaded in place: a load can be an entirely different set of records, and a
        //level whose parent is gone would otherwise be left behind
        this._services.find('grouping')?.captureExpandedRowGroupIds(
            gridApi.getState()?.rowGroupExpansion?.expandedRowGroupIds ?? []);
        gridApi.refreshServerSide({ purge: true });
    }

    /**
     * Nothing to do: a node expanded here asks the datasource for its children, and drawing them is what
     * the answer already does. `onGroupExpandedOrCollapsed` is a logged no-op on this model.
     */
    public applyExpansionChange(): void { }

    /**
     * Read off the selection state rather than the nodes: `getSelectedNodes` is backed by a map that only
     * node-level selection writes to, so it cannot see a state installed by `setServerSideSelectionState`.
     *
     * The ids are flat because this grid never sets `groupSelectsChildren` — the nested shape of
     * `toggledNodes` belongs to that mode, and a group here selects its children through the provider.
     */
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
