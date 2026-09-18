import { AggregationFunction, IColumn, IDataProvider, IInternalDataProvider, TotalRow } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridAggregationLabels } from "./labels";
import { IColumnHeaderAdornment, IColumnHeaderParams, IColumnMenuSection } from "../../services/column-header";
import { IGridAggregationServiceLocator } from "./services";

/** Which label names a total, per aggregation a column can carry. */
const TOTAL_LABELS: Record<string, keyof IGridAggregationLabels> = {
    avg: 'totalAverage',
    max: 'totalMaximum',
    min: 'totalMinimum',
    sum: 'totalSum',
    count: 'totalCount',
    countcolumn: 'totalCountColumn',
};

export interface IGridAggregationParameters {
    /** This module's own locator. */
    services: IGridAggregationServiceLocator;
    /** Whether a column's menu offers the totals, or the provider's own aggregations are all */
    allowUserAggregation: boolean;
}

/** The totals a grid shows, in the row pinned under the rest. */
export class GridAggregation {
    private _services: IGridAggregationServiceLocator;
    private _allowUserAggregation: boolean;
    private _totalRow?: TotalRow;
    private _isTotalRowSubscribed = false;

    constructor(parameters: IGridAggregationParameters) {
        this._services = parameters.services;
        this._allowUserAggregation = parameters.allowUserAggregation;
        this._gridServices.whenAvailable('gridApi', () => this._onGridApiAvailable());
    }

    /** The total row, but only if the dataset has ever carried an aggregation. */
    public getTotalRow(): TotalRow | undefined {
        return this._totalRow;
    }

    /** The total row, created if the dataset now carries an aggregation. */
    private _ensureTotalRow(): TotalRow | undefined {
        if (this._totalRow || !this._isDatasetAggregated()) {
            return this._totalRow;
        }
        return this._createTotalRow();
    }

    public canColumnBeAggregated(column: IColumn): boolean {
        return this._allowUserAggregation && (column.metadata?.SupportedAggregations ?? []).length > 0;
    }

    public addAggregation(columnName: string, aggregationFunction: AggregationFunction): void {
        this._write(() => (this._totalRow ?? this._createTotalRow()).addAggregation(columnName, aggregationFunction));
    }

    public removeAggregation(alias: string): void {
        this._write(() => this._totalRow?.removeAggregation(alias));
    }

    /** What the column is totalling, for the header's tooltip. */
    public applyColumnHeaderAdornments(adornments: IColumnHeaderAdornment[], params: IColumnHeaderParams): void {
        const column = params.column;
        const aggregationFunction = column?.aggregation?.aggregationFunction;
        if (!column || !aggregationFunction || this._services.get('gridServices').find('grouping')?.isColumnGrouped(column)) {
            return;
        }
        //named rather than drawn: a glyph competes with a long column name for the space
        adornments.push({
            key: 'total',
            placement: 'suffix',
            title: this._labels.getLocalizedString(TOTAL_LABELS[aggregationFunction]),
        });
    }

    /** The totals a column can show, as a submenu of what it is currently totalling. */
    public applyMenuSection(sections: IColumnMenuSection[], params: IColumnHeaderParams): void {
        const column = params.column;
        const supported = column?.metadata?.SupportedAggregations ?? [];
        if (!column || !this.canColumnBeAggregated(column) || !supported.length) {
            return;
        }
        const grouping = this._services.get('gridServices').find('grouping');
        sections.push({
            key: 'aggregation',
            title: this._labels.getLocalizedString('menuSection'),
            items: [
                //a grouped column totals by its groups, so there is no "none" to fall back to
                ...(grouping?.isColumnGrouped(column) ? [] : [{
                    key: 'none',
                    checked: !column.aggregation,
                    text: this._labels.getLocalizedString('totalNone'),
                    onClick: () => this.removeAggregation(column.aggregation?.alias!),
                }]),
                ...supported.map(aggregationFunction => ({
                    key: aggregationFunction,
                    checked: column.aggregation?.aggregationFunction === aggregationFunction,
                    text: this._labels.getLocalizedString(TOTAL_LABELS[aggregationFunction]),
                    onClick: () => this.addAggregation(column.name, aggregationFunction),
                })),
            ],
        });
    }

    /** Applies a change, then asks whoever owns the answer to work it out again. */
    private _write(change: () => void): void {
        const provider = this._provider;
        (provider as IInternalDataProvider).executeWithUnsavedChangesBlocker(() => {
            change();
            if (provider.grouping.getGroupBys().length > 0) {
                provider.refresh();
            }
            else {
                this._totalRow?.refresh();
            }
        });
    }

    private _onGridApiAvailable(): void {
        //a view change can bring in an aggregated column
        this._provider.addEventListener('onFirstDataLoaded', () => this._syncTotalRow());
        this._provider.addEventListener('onNewDataLoaded', () => this._syncTotalRow());
        //a save changes what the totals are over.
        this._provider.addEventListener('onAfterSaved', () => this._totalRow?.refresh());
        this._provider.addEventListener('onAfterRecordSaved', () => {
            if (this._gridServices.get('settings').isAutoSaveEnabled()) {
                this._totalRow?.refresh();
            }
        });
        this._syncTotalRow();
    }

    /** Puts the dataset's total under the rows, and keeps it there. */
    private _syncTotalRow(): void {
        const totalRow = this._ensureTotalRow();
        if (totalRow && !this._isTotalRowSubscribed) {
            this._isTotalRowSubscribed = true;
            totalRow.getDataProvider().addEventListener('onLoading', () => this._setPinnedRowData());
            totalRow.getDataProvider().addEventListener('onError', () => this._setPinnedRowData());
        }
        this._setPinnedRowData();
    }

    //a menu click can create the total row before there is a grid
    private _setPinnedRowData(): void {
        const gridApi = this._gridServices.find('gridApi');
        if (!gridApi || gridApi.isDestroyed()) {
            return;
        }
        const totalRecord = this._totalRow?.getTotalRowRecord() ?? null;
        gridApi.setGridOption('pinnedBottomRowData', totalRecord ? [totalRecord] : []);
    }

    private _isDatasetAggregated(): boolean {
        return this._provider.getColumns().some(column => !!column.aggregation?.aggregationFunction);
    }

    private _createTotalRow(): TotalRow {
        //assigned before it is put on the grid
        this._totalRow = new TotalRow(this._provider);
        this._syncTotalRow();
        return this._totalRow;
    }

    private get _labels(): ILocalizationService<IGridAggregationLabels> {
        return this._services.get('labels');
    }

    private get _gridServices() {
        return this._services.get('gridServices');
    }

    private get _provider(): IDataProvider {
        return this._gridServices.get('provider');
    }
}
