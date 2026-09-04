import { GridApi } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModel } from "../interfaces";

export interface IClientSideRowModelParameters {
    services: IGridServiceLocator;
}

/**
 * Every row at once, handed over as data.
 *
 * What a grid over a set already in memory wants: nothing is fetched, so no row is ever a placeholder and
 * anything reading the rows alongside the grid sees the same list at the same time.
 */
export class ClientSideRowModel implements IGridRowModel {
    private _services: IGridServiceLocator;

    constructor(parameters: IClientSideRowModelParameters) {
        this._services = parameters.services;
    }

    public getInitialComponentProps(): Partial<AgGridReactProps<IRecord>> {
        return { rowModelType: 'clientSide' };
    }

    public applyGridOptions(gridApi: GridApi<IRecord>): void {
        //asked of the grouping module, because a group row is one of its: a grid without it has none, and
        //nothing to open
        gridApi.setGridOption('isGroupOpenByDefault', params =>
            this._services.find('grouping')?.isGroupOpenByDefault(params.rowNode) ?? false);
    }

    public refresh(gridApi: GridApi<IRecord>): void {
        //the same records are handed over again: with `getRowId` set the grid works out the difference
        //itself and keeps the row objects it already has, so what is expanded, selected or being edited
        //survives a load
        gridApi.setGridOption('rowData', this._services.get('provider').getRecords());
    }

    public getSelectedRecordIds(gridApi: GridApi<IRecord>): string[] {
        return gridApi.getSelectedNodes().map(node => node.id).filter((id): id is string => !!id);
    }

    public setSelectedRecordIds(gridApi: GridApi<IRecord>, recordIds: string[]): void {
        const selectedIds = new Set(recordIds);
        const toSelect: any[] = [];
        const toDeselect: any[] = [];
        //one walk of the rows and two calls, rather than a write per row: every write of ours reports
        //itself as coming from the api, which is what the grid's selection handler ignores
        gridApi.forEachNode(node => {
            if (!node.id) {
                return;
            }
            const shouldBeSelected = selectedIds.has(node.id);
            if (shouldBeSelected !== node.isSelected()) {
                (shouldBeSelected ? toSelect : toDeselect).push(node);
            }
        });
        if (toSelect.length) {
            gridApi.setNodesSelected({ nodes: toSelect, newValue: true, source: 'api' });
        }
        if (toDeselect.length) {
            gridApi.setNodesSelected({ nodes: toDeselect, newValue: false, source: 'api' });
        }
    }
}
