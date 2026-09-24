import { ColDef, ICellRendererParams, IsFullWidthRowParams } from "@ag-grid-community/core";
import { FontWeights } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { AggregationFunction, IColumn, IDataProvider, IInternalDataProvider, IRecord, TotalRow } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridAggregationLabels } from "./labels";
import { IGridAggregationComponents } from "./moduleComponents";
import { IGridCellLoading } from "../../services/cells";
import { IGridRowHeight } from "../../services/rows";
import { FullWidthCellRendererError } from "@controls/grid/components/errors/full-width-cell-renderer-error/FullWidthCellRendererError";
import { IGridAgGridOptions } from "../../services/runtime";
import { CellEmptyRenderer } from "../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { IGridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridAggregationServiceLocator } from "./services";
import { GRID_MODULE_PRIORITY } from "../priorities";

/** What the row stands in as until the totals are worked out. */
const PENDING_RECORD_ID = '__total__pending';

/** What the total row's label and value need, drawn one above the other. */
const MIN_TOTAL_ROW_HEIGHT = 42;

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
    allowUserAggregation?: boolean;
}

/** The totals a grid shows, in the row pinned under the rest. */
export interface IGridAggregation {
    /** The total row, but only if the dataset has ever carried an aggregation. */
    getTotalRow(): TotalRow | undefined;
    canColumnBeAggregated(column: IColumn): boolean;
    addAggregation(columnName: string, aggregationFunction: AggregationFunction): void;
    removeAggregation(alias: string): void;
    /** What the column's total is called, for the row pinned under the rest. */
    getTotalLabel(columnName: string): string | undefined;
    /** What a row holds a column's aggregate under: the alias the aggregation was asked for by. */
    getAggregateValueColumnName(record: IRecord, columnName: string): string;
}

export class GridAggregation implements IGridAggregation {
    private _services: IGridAggregationServiceLocator;
    private _allowUserAggregation: boolean;
    private _totalRow?: TotalRow;
    private _totalRecord?: IRecord;
    private _pendingRecord?: IRecord;
    private _isTotalRowSubscribed = false;
    private _pinnedBottomRowData?: IRecord[];

    constructor(parameters: IGridAggregationParameters) {
        this._services = parameters.services;
        this._allowUserAggregation = parameters.allowUserAggregation ?? true;
        this._gridServices.whenAvailable('gridApi', () => this._onGridApiAvailable());
        this._registerHooks();
    }

    /** What this module has to say about what the grid draws, in the order the grid asks. */
    private _registerHooks(): void {
        const columnHeaders = this._gridServices.get('columns').headers;
        this._gridServices.get('grid').registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.aggregation);
        //behind grouping, so what it draws in a group's row is the last word on that cell
        this._gridServices.get('columns').registerColumnDefinitionsHook(this._onColumnDefinitions, GRID_MODULE_PRIORITY.aggregation);
        this._gridServices.get('cells').registerCellThemeHook(this._onCellTheme, GRID_MODULE_PRIORITY.aggregation);
        this._gridServices.get('cells').registerCellLoadingHook(this._onCellLoading, GRID_MODULE_PRIORITY.aggregation);
        this._gridServices.get('rows').registerRowHeightHook(this._onRowHeight, GRID_MODULE_PRIORITY.aggregation);
        //behind grouping, which a column's menu offers first
        columnHeaders.registerColumnMenuSectionHook(this._onMenuSection, GRID_MODULE_PRIORITY.aggregation);
        columnHeaders.registerColumnHeaderAdornmentsHook(this._onColumnHeaderAdornments, GRID_MODULE_PRIORITY.aggregation);
    }

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

    /** Every cell that will hold a total waits, because one fetch answers all of them. */
    private _onCellLoading = (result: IGridCellLoading, params: { record: IRecord; columnName: string }): void => {
        if (!this._isTotalRecord(params.record) || !this._provider.getColumnsMap()[params.columnName]?.aggregation?.aggregationFunction) {
            return;
        }
        result.isLoading = !!this._totalRow?.getDataProvider().isLoading();
    };

    /** The total row reads as what the rows above add up to, the way a group row reads as what it holds. */
    private _onCellTheme = (theme: ThemeBuilder, params: { record: IRecord; columnName: string }): void => {
        if (!this._isTotalRecord(params.record)) {
            return;
        }
        //the faintest step off the surface Fluent has, whatever the grid does about striping
        theme.colors.background = this._gridTheme.palette.neutralLighterAlt;
        theme.edit('aggregation|totalRow', result => { result.fonts.medium.fontWeight = FontWeights.semibold; });
    };

    private _onRowHeight = (result: IGridRowHeight, params: { record: IRecord }): void => {
        if (!this._isTotalRecord(params.record)) {
            return;
        }
        result.height = Math.max(result.height ?? this._gridServices.get('settings').getDefaultRowHeight(), MIN_TOTAL_ROW_HEIGHT);
    };

    /** Whether this is the record the module pinned under the rows, whatever state that record is in. */
    private _isTotalRecord(record: IRecord): boolean {
        return record === this._totalRecord;
    }

    /** Whether the record stands for a group rather than for one of the rows a group holds. */
    private _isGroupRecord(record: IRecord): boolean {
        return record.getDataProvider().getSummarizationType() === 'grouping';
    }

    /** Whether the column totals something of its own: a grouped column counts itself, which is not one. */
    private _isColumnAggregated(column: IColumn | undefined): boolean {
        return !!column?.aggregation?.aggregationFunction && !column.grouping?.isGrouped;
    }

    public getTotalLabel(columnName: string): string | undefined {
        const aggregationFunction = this._provider.getColumnsMap()[columnName]?.aggregation?.aggregationFunction;
        return aggregationFunction ? this._labels.getLocalizedString(TOTAL_LABELS[aggregationFunction]) : undefined;
    }

    public getAggregateValueColumnName(record: IRecord, columnName: string): string {
        const alias = this._provider.getColumnsMap()[columnName]?.aggregation?.alias;
        return alias && record.getDataProvider().getColumnsMap()[alias] ? alias : columnName;
    }

    /** What every column draws where a row is a total of other rows rather than one of them. */
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const columnsMap = this._provider.getColumnsMap();
        for (const colDef of columnDefs.filter(colDef => !!columnsMap[colDef.colId ?? colDef.field ?? ''])) {
            const columnName = colDef.colId ?? colDef.field!;
            this._applyAggregateRenderer(colDef, columnName);
            this._applyAggregateValue(colDef, columnName);
        }
    };

    /** The total row draws what it totals, a group row what the group adds up to, and nothing else. */
    private _applyAggregateRenderer(colDef: ColDef<IRecord>, columnName: string): void {
        const cellRendererSelector = colDef.cellRendererSelector;
        colDef.cellRendererSelector = params => {
            //read now rather than captured: a menu click totals a column without rebuilding the definitions
            const column = this._provider.getColumnsMap()[columnName];
            //the row this module pinned, rather than any row something else pinned
            if (params.data && this._isTotalRecord(params.data)) {
                return column?.aggregation?.aggregationFunction
                    ? { component: this._onRenderTotalCell }
                    : { component: CellEmptyRenderer };
            }
            if (params.data && this._isGroupRecord(params.data) && this._isColumnAggregated(column)) {
                return { component: this._onRenderAggregateCell };
            }
            return cellRendererSelector?.(params);
        };
    }

    /** A cell that stands for a total answers with it, and every other cell with the record's own value. */
    private _applyAggregateValue(colDef: ColDef<IRecord>, columnName: string): void {
        const valueGetter = colDef.valueGetter;
        const valueFormatter = colDef.valueFormatter;
        colDef.valueGetter = params => this._isAggregateCell(params.data, columnName)
            ? this._getAggregateValue(params.data, columnName)
            : (typeof valueGetter === 'function' ? valueGetter(params) : undefined);
        colDef.valueFormatter = params => this._isAggregateCell(params.data, columnName)
            ? this._getAggregateFormattedValue(params.data, columnName)
            : (typeof valueFormatter === 'function' ? valueFormatter(params) : '');
    }

    /** Whether what this column holds in this row is a total rather than a record's own value. */
    private _isAggregateCell(record: IRecord | undefined, columnName: string): boolean {
        if (!record) {
            return false;
        }
        return this._isTotalRecord(record) || (this._isGroupRecord(record) && this._isColumnAggregated(this._provider.getColumnsMap()[columnName]));
    }

    /** What a row holds for a column: the aggregate, or nothing where it totals nothing. */
    private _getAggregateValue(record: IRecord | undefined, columnName: string): any {
        return record ? record.getValue(this.getAggregateValueColumnName(record, columnName)) : null;
    }

    private _getAggregateFormattedValue(record: IRecord | undefined, columnName: string): string {
        return record ? record.getFormattedValue(this.getAggregateValueColumnName(record, columnName)) ?? '' : '';
    }

    //the render methods reached through a field of ours.
    private _onRenderTotalCell = (props: ICellRendererParams<IRecord>): JSX.Element => this._components.onRenderTotalCell(props);

    private _onRenderAggregateCell = (props: ICellRendererParams<IRecord>): JSX.Element => this._components.onRenderAggregateCell(props);

    /** What the column is totalling, for the header's tooltip. */
    private _onColumnHeaderAdornments = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
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
    };

    /** The totals a column can show, as a submenu of what it is currently totalling. */
    private _onMenuSection = (sections: IColumnMenuSection[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
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
    };

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

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.isFullWidthRow = this._isFullWidthRow;
        result.options.fullWidthCellRenderer = FullWidthCellRendererError;
        result.options.fullWidthCellRendererParams = this._getFullWidthCellRendererParams;
        result.options.pinnedBottomRowData = this._pinnedBottomRowData;
    };

    private _isFullWidthRow = (params: IsFullWidthRowParams<IRecord>): boolean => {
        const provider = params.rowNode.data?.getDataProvider();
        return provider?.getSummarizationType() === 'aggregation' && provider.isError();
    };

    private _getFullWidthCellRendererParams = (params: IsFullWidthRowParams<IRecord>) => ({
        errorMessage: params.rowNode.data?.getDataProvider().getErrorMessage(),
    });

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
        const totalRecord = this._getTotalRecord();
        if (totalRecord === this._totalRecord) {
            //a pinned node is not keyed by the record's id, so it is asked for rather than looked up
            const node = gridApi.getPinnedBottomRow(0);
            if (node) {
                gridApi.refreshCells({ rowNodes: [node], force: true });
            }
            return;
        }
        this._totalRecord = totalRecord;
        this._pinnedBottomRowData = totalRecord ? [totalRecord] : [];
        this._gridServices.get('grid').refreshAgGridOptions();
    }

    /** The record the row draws: the totals, or what stands in for them while they are worked out. */
    private _getTotalRecord(): IRecord | undefined {
        const provider = this._totalRow?.getDataProvider();
        if (!this._totalRow || !provider) {
            return undefined;
        }
        //while it is working the row keeps what it had, or stands in for what is coming
        if (provider.isLoading() || provider.isError()) {
            return this._totalRecord ?? this._getPendingRecord(provider);
        }
        return this._totalRow.getTotalRowRecord() ?? undefined;
    }

    /** A row to wait in until the first totals arrive, which is cheaper than a dataset to hold one. */
    private _getPendingRecord(provider: IDataProvider): IRecord {
        //not in the dataset: it stands for a record rather than being one
        this._pendingRecord ??= (provider as IInternalDataProvider).newRecord({ recordId: PENDING_RECORD_ID, addToDataset: false });
        return this._pendingRecord;
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

    private get _components(): IGridAggregationComponents {
        return this._services.get('components');
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

    private get _gridTheme() {
        return this._gridServices.get('theme');
    }
}
