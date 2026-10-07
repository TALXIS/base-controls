import { ColDef, ICellRendererParams, IsFullWidthRowParams } from "ag-grid-community";
import { FontWeights } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { AggregationFunction, IColumn, IDataProvider, IInternalDataProvider, IRecord, TotalRow } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridAggregationLabels } from "./labels";
import { IGridAggregationComponents } from "./moduleComponents";
import { IGridCellLoading } from "../../services/cells";
import { IGridRowHeight } from "../../services/rows";
import { RowError } from "@controls/grid/components/rows/error";
import { IGridAgGridOptions } from "../../services/runtime";
import { CellEmptyRenderer } from "../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { TotalCell } from "./components/total-cell/TotalCell";
import { AggregateCell } from "./components/aggregate-cell/AggregateCell";
import { IGridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridAggregationServiceLocator } from "./services";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { ITheme } from "@theme";
import { IGridAgTheme } from "../../services/theme";

declare module "../../services/interfaces" {
    interface IGridModuleServiceMap {
        /** The totals under the rows. */
        aggregation: IGridAggregation;
    }
}

/** What the row stands in as until the totals are worked out. */
const PENDING_RECORD_ID = '__total__pending';

/** The height the total row's stacked label and value need. */
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
    /** Whether a column's menu offers the totals. */
    allowUserAggregation?: boolean;
}

/** The totals a grid shows, in the row pinned under the rest. */
export interface IGridAggregation {
    /** The parts of what this module draws, as the caller replaced them. */
    readonly components: IGridAggregationComponents;
    canColumnBeAggregated(column: IColumn): boolean;
    addAggregation(columnName: string, aggregationFunction: AggregationFunction): void;
    removeAggregation(alias: string): void;
    /** What the column's total is called, for the row pinned under the rest. */
    getTotalLabel(columnName: string): string | undefined;
    /** The alias a row holds a column's aggregate under. */
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
        this._gridServices.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
        this._registerHooks();
    }

    private _onTheme = (result: IGridAgTheme, theme: ITheme): void => {
        result.theme = result.theme.withParams({ pinnedRowBorder: { color: theme.semanticColors.bodyDivider } });
    };

    /** What this module has to say about what the grid draws, in the order the grid asks. */
    private _registerHooks(): void {
        const columnHeaders = this._gridServices.get('columns').headers;
        this._gridServices.get('grid').registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.aggregation);
        this._gridServices.get('gridTheme').registerTheme(this._onTheme, GRID_MODULE_PRIORITY.aggregation);
        //runs after grouping to have the last word on a group row's cell
        this._gridServices.get('columns').registerColumnDefinitions(this._onColumnDefinitions, GRID_MODULE_PRIORITY.aggregation);
        this._gridServices.get('cells').registerCellTheme(this._onCellTheme, GRID_MODULE_PRIORITY.aggregation);
        this._gridServices.get('cells').registerCellLoading(this._onCellLoading, GRID_MODULE_PRIORITY.aggregation);
        this._gridServices.get('rows').registerRowHeight(this._onRowHeight, GRID_MODULE_PRIORITY.aggregation);
        //listed in the column menu after grouping
        columnHeaders.registerColumnMenuSection(this._onMenuSection, GRID_MODULE_PRIORITY.aggregation);
        columnHeaders.registerColumnHeaderAdornments(this._onColumnHeaderAdornments, GRID_MODULE_PRIORITY.aggregation);
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

    /** Styles the total row like a group row. */
    private _onCellTheme = (theme: ThemeBuilder, params: { record: IRecord; columnName: string }): void => {
        if (!this._isTotalRecord(params.record)) {
            return;
        }
        //the faintest step off the surface Fluent has
        theme.colors.background = this._gridTheme.palette.neutralLighterAlt;
        theme.edit('aggregation|totalRow', result => { result.fonts.medium.fontWeight = FontWeights.semibold; });
    };

    private _onRowHeight = (result: IGridRowHeight, params: { record: IRecord }): void => {
        if (!this._isTotalRecord(params.record)) {
            return;
        }
        result.height = Math.max(result.height ?? this._gridServices.get('settings').getDefaultRowHeight(), MIN_TOTAL_ROW_HEIGHT);
    };

    /** Whether this is the record the module pinned under the rows. */
    private _isTotalRecord(record: IRecord): boolean {
        return record === this._totalRecord;
    }

    /** Whether the record stands for a group. */
    private _isGroupRecord(record: IRecord): boolean {
        return record.getDataProvider().getSummarizationType() === 'grouping';
    }

    /** Whether the column totals something other than a count of its own groups. */
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

    /** What every column draws in a total or group row. */
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const columnsMap = this._provider.getColumnsMap();
        for (const colDef of columnDefs.filter(colDef => !!columnsMap[colDef.colId ?? colDef.field ?? ''])) {
            const columnName = colDef.colId ?? colDef.field!;
            this._applyAggregateRenderer(colDef, columnName);
            this._applyAggregateValue(colDef, columnName);
        }
    };

    /** Draws totals in the total row and aggregates in a group row. */
    private _applyAggregateRenderer(colDef: ColDef<IRecord>, columnName: string): void {
        const cellRendererSelector = colDef.cellRendererSelector;
        colDef.cellRendererSelector = params => {
            //read per call: a menu click totals a column without rebuilding the definitions
            const column = this._provider.getColumnsMap()[columnName];
            //only the row this module pinned
            if (params.data && this._isTotalRecord(params.data)) {
                return column?.aggregation?.aggregationFunction
                    ? { component: TotalCell }
                    : { component: CellEmptyRenderer };
            }
            if (params.data && this._isGroupRecord(params.data) && this._isColumnAggregated(column)) {
                return { component: AggregateCell };
            }
            return cellRendererSelector?.(params);
        };
    }

    /** Makes a cell that stands for a total read the aggregate. */
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

    /** Whether this column holds a total in this row. */
    private _isAggregateCell(record: IRecord | undefined, columnName: string): boolean {
        if (!record) {
            return false;
        }
        return this._isTotalRecord(record) || (this._isGroupRecord(record) && this._isColumnAggregated(this._provider.getColumnsMap()[columnName]));
    }

    /** The aggregate a row holds for a column. */
    private _getAggregateValue(record: IRecord | undefined, columnName: string): any {
        return record ? record.getValue(this.getAggregateValueColumnName(record, columnName)) : null;
    }

    private _getAggregateFormattedValue(record: IRecord | undefined, columnName: string): string {
        return record ? record.getFormattedValue(this.getAggregateValueColumnName(record, columnName)) ?? '' : '';
    }



    /** What the column is totalling, for the header's tooltip. */
    private _onColumnHeaderAdornments = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
        const aggregationFunction = column?.aggregation?.aggregationFunction;
        if (!column || !aggregationFunction || this._services.get('gridServices').find('grouping')?.isColumnGrouped(column)) {
            return;
        }
        //no glyph: it competes with a long column name for the space
        adornments.push({
            key: 'total',
            placement: 'suffix',
            title: this._labels.getLocalizedString(TOTAL_LABELS[aggregationFunction]),
        });
    };

    /** The totals a column's menu offers, with the current one checked. */
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
                //a grouped column always totals by its groups
                ...(grouping?.isColumnGrouped(column) ? [] : [{
                    key: 'none',
                    checked: !column.aggregation,
                    text: this._labels.getLocalizedString('totalNone'),
                    onClick: () => {
                        //already none: nothing to remove
                        if (column.aggregation?.alias) {
                            this.removeAggregation(column.aggregation.alias);
                        }
                    },
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

    /** Applies a change and refreshes whatever computes the totals. */
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
        this._provider.addEventListener('onFirstDataLoaded', this._syncTotalRow);
        this._provider.addEventListener('onNewDataLoaded', this._syncTotalRow);
        //a save changes what the totals are over
        this._provider.addEventListener('onAfterSaved', this._onAfterSaved);
        this._provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this._syncTotalRow();
    }

    private _onAfterSaved = (): void => {
        this._totalRow?.refresh();
    };

    private _onAfterRecordSaved = (): void => {
        this._totalRow?.refresh();
    };

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onFirstDataLoaded', this._syncTotalRow);
        this._provider.removeEventListener('onNewDataLoaded', this._syncTotalRow);
        this._provider.removeEventListener('onAfterSaved', this._onAfterSaved);
        this._provider.removeEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this._totalRow?.destroy();
    };

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.isFullWidthRow = this._isFullWidthRow;
        result.options.fullWidthCellRenderer = RowError;
        result.options.fullWidthCellRendererParams = this._getFullWidthCellRendererParams;
        result.options.pinnedBottomRowData = this._pinnedBottomRowData;
    };

    private _isFullWidthRow = (params: IsFullWidthRowParams<IRecord>): boolean => {
        const provider = params.rowNode.data?.getDataProvider();
        return provider?.getSummarizationType() === 'aggregation' && provider.isError();
    };

    //handed the renderer's own params, not the ones `isFullWidthRow` is asked with
    private _getFullWidthCellRendererParams = (params: ICellRendererParams<IRecord>) => ({
        errorMessage: params.data?.getDataProvider().getErrorMessage(),
    });

    /** Puts the dataset's total under the rows, and keeps it there. */
    private _syncTotalRow = (): void => {
        const totalRow = this._ensureTotalRow();
        if (totalRow && !this._isTotalRowSubscribed) {
            this._isTotalRowSubscribed = true;
            totalRow.getDataProvider().addEventListener('onLoading', () => this._setPinnedRowData());
            //the pinned node is reused by its id
            totalRow.getDataProvider().addEventListener('onNewDataLoaded', () => this._setPinnedRowData());
            totalRow.getDataProvider().addEventListener('onError', () => this._setPinnedRowData());
        }
        this._setPinnedRowData();
    };

    //a menu click can create the total row before there is a grid
    private _setPinnedRowData(): void {
        const gridApi = this._gridServices.find('gridApi');
        if (!gridApi || gridApi.isDestroyed()) {
            return;
        }
        const totalRecord = this._getTotalRecord();
        if (totalRecord === this._totalRecord) {
            //a pinned node is not keyed by the record's id
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

    /** The record the total row draws, or a placeholder while the totals load. */
    private _getTotalRecord(): IRecord | undefined {
        const provider = this._totalRow?.getDataProvider();
        if (!this._totalRow || !provider) {
            return undefined;
        }
        //while loading the row keeps its last record or a placeholder
        if (provider.isLoading() || provider.isError()) {
            return this._totalRecord ?? this._getPendingRecord(provider);
        }
        return this._totalRow.getTotalRowRecord() ?? undefined;
    }

    /** A placeholder row until the first totals arrive. */
    private _getPendingRecord(provider: IDataProvider): IRecord {
        //not in the dataset: it only stands in for a record
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

    public get components(): IGridAggregationComponents {
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
