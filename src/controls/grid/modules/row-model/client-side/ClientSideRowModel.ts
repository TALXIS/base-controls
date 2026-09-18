import { GridApi } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModel } from "../interfaces";

export interface IClientSideRowModelParameters {
    services: IGridServiceLocator;
}

/** Every row at once, handed over as data. */
export class ClientSideRowModel implements IGridRowModel {
    private _services: IGridServiceLocator;

    constructor(parameters: IClientSideRowModelParameters) {
        this._services = parameters.services;
    }

    public getInitialComponentProps(): Partial<AgGridReactProps<IRecord>> {
        return { rowModelType: 'clientSide' };
    }

    public applyGridOptions(gridApi: GridApi<IRecord>): void {
        //asked of the grouping module, because a group row is one of its
        gridApi.setGridOption('isGroupOpenByDefault', params =>
            this._services.find('grouping')?.isGroupOpenByDefault(params.rowNode) ?? false);
    }

    /** Asked of the grouping module where there is one. */
    public refresh(gridApi: GridApi<IRecord>): void {
        //the same records are handed over again
        gridApi.setGridOption('rowData',
            this._services.find('grouping')?.getRows() ?? this._services.get('provider').getRecords());
    }

    public applyExpansionChange(gridApi: GridApi<IRecord>): void {
        gridApi.onGroupExpandedOrCollapsed();
    }

    public getSelectedRecordIds(gridApi: GridApi<IRecord>): string[] {
        return gridApi.getSelectedNodes().map(node => node.id).filter((id): id is string => !!id);
    }

    public setSelectedRecordIds(gridApi: GridApi<IRecord>, recordIds: string[]): void {
        const selectedIds = new Set(recordIds);
        const toSelect: any[] = [];
        const toDeselect: any[] = [];
        //one walk of the rows and two calls, rather than a write per row
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
