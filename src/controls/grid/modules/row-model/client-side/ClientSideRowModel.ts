import { GridApi } from "@ag-grid-community/core";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModel, IGridRowModelGroupingParameters } from "../interfaces";
import { ClientSideRowModelGrouping } from "./ClientSideRowModelGrouping";

export interface IClientSideRowModelParameters {
    services: IGridServiceLocator;
}

/** Every row at once, handed over as data. */
export class ClientSideRowModel implements IGridRowModel {
    private _services: IGridServiceLocator;
    private _grouping?: ClientSideRowModelGrouping;

    constructor(parameters: IClientSideRowModelParameters) {
        this._services = parameters.services;
    }

    public getInitialComponentProps(): Partial<AgGridReactProps<IRecord>> {
        return { rowModelType: 'clientSide' };
    }

    public applyGridOptions(gridApi: GridApi<IRecord>): void {
        gridApi.setGridOption('isGroupOpenByDefault', params => this._grouping?.isGroupOpenByDefault(params.rowNode) ?? false);
    }

    public refresh(gridApi: GridApi<IRecord>): void {
        gridApi.setGridOption('rowData', this._grouping?.getRows() ?? this._services.get('provider').getRecords());
    }

    public createGrouping(parameters: IGridRowModelGroupingParameters): ClientSideRowModelGrouping {
        this._grouping = new ClientSideRowModelGrouping({
            ...parameters,
            services: this._services,
            onRowsLoaded: gridApi => this.refresh(gridApi),
        });
        return this._grouping;
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
