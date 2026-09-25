import { GridApi, IsGroupOpenByDefaultParams } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModel, IGridRowModelGroupingParameters, IGridRowModelType } from "../interfaces";
import { ClientSideRowModelGrouping } from "./ClientSideRowModelGrouping";
import { IGridAgGridOptions } from "../../../services/runtime";
import { GRID_MODULE_PRIORITY } from "../../priorities";

export interface IClientSideRowModelParameters {
    services: IGridServiceLocator;
}

/** Every row at once, handed over as data. */
export class ClientSideRowModel implements IGridRowModel {
    private _services: IGridServiceLocator;
    private _grouping?: ClientSideRowModelGrouping;
    //never unset: tree data switched on before any rows leaves AG Grid's tree without a root
    private _rows: IRecord[] = [];
    public readonly type: IGridRowModelType = 'clientSide';

    constructor(parameters: IClientSideRowModelParameters) {
        this._services = parameters.services;
        this._services.get('grid').registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.rowModel);
    }

    public refresh(): void {
        this._rows = this._grouping?.getRows() ?? this._provider.getRecords();
        this._services.get('grid').refreshAgGridOptions();
    }

    public createGrouping(parameters: IGridRowModelGroupingParameters): ClientSideRowModelGrouping {
        this._grouping = new ClientSideRowModelGrouping({
            ...parameters,
            services: this._services,
            onRowsLoaded: () => this.refresh(),
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

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.isGroupOpenByDefault = this._isGroupOpenByDefault;
        //ahead of the rows, which `treeData` decides how to read
        this._grouping?.onAgGridOptions(result);
        result.options.rowData = this._rows;
    };

    private _isGroupOpenByDefault = (params: IsGroupOpenByDefaultParams<IRecord>): boolean => this._grouping?.isGroupOpenByDefault(params.rowNode) ?? false;

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
