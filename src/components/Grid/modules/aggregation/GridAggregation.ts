import { AggregationFunction, IColumn, IDataProvider, IInternalDataProvider, TotalRow } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridAggregationLabels } from "./labels";
import { IGridColumnHeaderAdornment, IGridColumnMenuSection } from "../../grid/column-header";
import { IGridColumn } from "../../grid/columns";
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
    /** This module's own locator, which is what everything inside it reaches through. */
    services: IGridAggregationServiceLocator;
    /** Whether a column's menu offers the totals, or the provider's own aggregations are all there is. */
    allowUserAggregation: boolean;
}

/**
 * The totals a grid shows, in the row pinned under the rest.
 *
 * A pinned row rather than a footer of AG Grid's, so the total is the dataset's answer rather than the
 * grid's arithmetic over the rows it happens to have loaded.
 */
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

    /**
     * The total row, created if the dataset now carries an aggregation.
     *
     * The provider clones the whole data provider, so this is put off until there is something to total.
     */
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

    /**
     * What the column is totalling, for the header's tooltip.
     *
     * Left off a grouped column: it totals per group there, which the group rows already say.
     */
    public applyColumnHeaderAdornments(adornments: IGridColumnHeaderAdornment[], column: IGridColumn): void {
        const aggregationFunction = column.aggregation?.aggregationFunction;
        if (!aggregationFunction || this._services.get('gridServices').find('grouping')?.isColumnGrouped(column)) {
            return;
        }
        //named rather than drawn: the total itself is already under the rows, and a glyph beside the name
        //only competes with it for the space a long column name needs
        adornments.push({
            key: 'total',
            placement: 'suffix',
            title: this._labels.getLocalizedString(TOTAL_LABELS[aggregationFunction]),
        });
    }

    /** The totals a column can show, as a submenu of what it is currently totalling. */
    public applyMenuSection(sections: IGridColumnMenuSection[], column: IGridColumn): void {
        const supported = column.metadata?.SupportedAggregations ?? [];
        if (!this.canColumnBeAggregated(column) || !supported.length) {
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

    /**
     * Applies a change, then asks whoever owns the answer to work it out again.
     *
     * A grouped dataset totals per group, so the whole thing reloads; an ungrouped one only has the total
     * row to recompute.
     */
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
        //a view change can bring in an aggregated column, which is what creates the total row - so this is
        //asked again on every load rather than only on the first
        this._provider.addEventListener('onFirstDataLoaded', () => this._syncTotalRow());
        this._provider.addEventListener('onNewDataLoaded', () => this._syncTotalRow());
        //a save changes what the totals are over. An auto-saving grid saves a record at a time, which is
        //why the per-record event is only worth listening to there
        this._provider.addEventListener('onAfterSaved', () => this._totalRow?.refresh());
        this._provider.addEventListener('onAfterRecordSaved', () => {
            if (this._gridServices.get('settings').isAutoSaveEnabled()) {
                this._totalRow?.refresh();
            }
        });
        this._syncTotalRow();
    }

    /**
     * Puts the dataset's total under the rows, and keeps it there.
     *
     * Idempotent: the total row only comes into existence once the dataset carries an aggregation, which can
     * be long after the grid mounted. A grid whose dataset never aggregates leaves the pinned rows alone
     * entirely, because other features own that row too (see `CheckListGridCustomizer`).
     */
    private _syncTotalRow(): void {
        const totalRow = this._ensureTotalRow();
        if (totalRow && !this._isTotalRowSubscribed) {
            this._isTotalRowSubscribed = true;
            totalRow.getDataProvider().addEventListener('onLoading', () => this._setPinnedRowData());
            totalRow.getDataProvider().addEventListener('onError', () => this._setPinnedRowData());
        }
        this._setPinnedRowData();
    }

    //a total row can be created by a menu click before or after there is a grid; only the grid's copy of
    //it needs one, and the row itself is the dataset's either way
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
        //assigned before it is put on the grid, so anything reading the module back sees the instance
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
