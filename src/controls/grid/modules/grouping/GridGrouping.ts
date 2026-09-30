import { createElement } from "react";
import { ColDef, IRowNode } from "@ag-grid-community/core";
import { FontWeights } from "@fluentui/react";
import { DataProvider, DataTypes, EventEmitter, Formatting, Grouping, IColumn, IEventEmitter, IGroupByMetadata, IDataProvider, IInternalDataProvider, IInterceptor, IRecord } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { ThemeBuilder } from "@theme";
import { IGridGroupingLabels } from "./labels";
import { GridGroupingIconComponents, IGridGroupingComponents } from "./moduleComponents";
import { IGridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridGroupingServiceLocator } from "./services";
import { getGroupExpansionColumnDefinition } from "./getGroupExpansionColumnDefinition";
import { CellEmptyRenderer } from "../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { GroupCell } from "./components/group-cell/GroupCell";
import { GroupSelectionLimitDialog } from "./components/group-selection-limit-dialog/GroupSelectionLimitDialog";
import { IGridRowModelGrouping } from "../row-model/interfaces";
import { IGridSurface } from "../../services/surfaces";
import { IGridRowSelectionInterceptors } from "../row-selection";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { GridEditableHook } from "../../services/editability";

/** The chevron and the count a group row draws beside the value. */
const GROUPED_COLUMN_WIDTH_OFFSET = 80;

/** How many children a group loads before it stops and says so. */
const CHILD_LIMIT = 5000;

/** How many groups load their records at the same time while a selection waits for them. */
const CONCURRENT_GROUP_LOADS = 5;

export interface IGridGroupingEvents {
    onGroupSelectionLimitDialogChanged: () => void;
}

export interface IGroupingSettings {
    /** Whether a column's menu offers grouping. */
    allowUserGrouping: boolean;
    /** How the groups nest. */
    type: 'nested' | 'flat';
    /** How many levels open themselves. */
    defaultExpandedLevel: number;
    /** Whether a grouped column is pinned to the left. */
    pinGroupedColumns: boolean;
    /** How many groups one selection may load the records of before it is refused. */
    maxGroupLoadsPerSelection: number;
}

export interface IGridGroupingParameters {
    /** This module's own locator. */
    services: IGridGroupingServiceLocator;
    /** Anything left out takes its default. */
    settings?: Partial<IGroupingSettings>;
}

/** Grouping the rows by a column, on whichever row model the grid runs. */
export interface IGridGrouping {
    readonly events: IEventEmitter<IGridGroupingEvents>;
    getMaxGroupLoadsPerSelection(): number;
    isGroupSelectionLimitDialogOpen(): boolean;
    closeGroupSelectionLimitDialog(): void;
    /** The strings this module renders, for its own components. */
    getLabels(): ILocalizationService<IGridGroupingLabels>;
    isColumnGrouped(column: IColumn): boolean;
    canColumnBeGrouped(column: IColumn): boolean;
    /** Whether the row stands for a group rather than for a record. */
    isGroupRow(node: IRowNode<IRecord>): boolean;
    /** The name a row holds a grouped column's value under. */
    getGroupedValueColumnName(record: IRecord, columnName: string): string;
    /** How many records a group holds when the column's aggregation is a count. */
    getGroupedCount(record: IRecord, columnName: string): number | undefined;
    /** Whether a row's cell in this column carries the chevron that opens it. */
    isColumnExpandable(record: IRecord, columnName: string): boolean;
    /** Whether the row stands for a group of this column. */
    isRowGroupedBy(record: IRecord, columnName: string): boolean;
    /** How many levels of groups are open. */
    getExpandedLevel(): number;
    /** The deepest level there is to open. */
    getDeepestLevel(): number;
    /** Opens the groups down to a level and closes the rest. */
    setExpandedLevel(level: number): void;
    toggleGroup(node: IRowNode<IRecord>): void;
    toggleColumnGroup(columnName: string): void;
    /** The parts of what this module draws, as the caller replaced them. */
    readonly components: IGridGroupingComponents;
}

export class GridGrouping implements IGridGrouping {
    private _services: IGridGroupingServiceLocator;
    private _settings: IGroupingSettings;
    private _grouping: Grouping;
    private _rowModelGrouping?: IGridRowModelGrouping;
    /** How many levels of groups are open. */
    private _expandedLevel: number;
    private _hasUserExpanded: boolean = false;
    private _hasReportedChildLimit = false;
    private _isGroupSelectionLimitDialogOpen: boolean = false;
    public readonly events: IEventEmitter<IGridGroupingEvents> = new EventEmitter<IGridGroupingEvents>();

    constructor(parameters: IGridGroupingParameters) {
        this._services = parameters.services;
        const {
            allowUserGrouping = true,
            type = 'nested',
            defaultExpandedLevel = -1,
            pinGroupedColumns = true,
            maxGroupLoadsPerSelection = 100,
        } = parameters.settings ?? {};
        
        this._settings = { allowUserGrouping, type, defaultExpandedLevel, pinGroupedColumns, maxGroupLoadsPerSelection };
        this._expandedLevel = defaultExpandedLevel;
        this._grouping = new Grouping(this._provider);
        //overrides the provider's nested default
        this._provider.setProperty('groupingType', this._settings.type);
        this._gridServices.whenAvailable('rowModel', rowModel => this._rowModelGrouping = rowModel.createGrouping({ isGroupOpenByDefault: this._isGroupOpenByDefault }));
        this._gridServices.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
        //only a grouped provider has children to run out of
        this._provider.addEventListener('onNestedProviderPagingLimitReached', this._onNestedProviderPagingLimitReached);
        this._provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this._registerHooks();
    }

    /** What this module has to say about what the grid draws, in the order the grid asks. */
    private _registerHooks(): void {
        const cells = this._gridServices.get('cells');
        const columnHeaders = this._gridServices.get('columns').headers;
        this._gridServices.get('grid').registerAgGridOptions(result => result.options.groupDisplayType = 'custom', GRID_MODULE_PRIORITY.grouping);
        this._gridServices.get('columns').registerColumnDefinitionsHook(this._onColumnDefinitions, GRID_MODULE_PRIORITY.grouping);
        cells.registerCellThemeHook(this._onCellTheme, GRID_MODULE_PRIORITY.grouping);
        this._gridServices.get('editability').registerEditableHook(this._onEditable, GRID_MODULE_PRIORITY.grouping);
        //listed in the column menu after sorting and filtering
        columnHeaders.registerColumnMenuSectionHook(this._onMenuSection, GRID_MODULE_PRIORITY.grouping);
        columnHeaders.registerColumnHeaderAdornmentsHook(this._onColumnHeaderAdornments, GRID_MODULE_PRIORITY.grouping);
        this._gridServices.get('surfaces').registerSurfaceHook(this._onSurfaces, GRID_MODULE_PRIORITY.grouping);
        this._gridServices.whenAvailable('rowSelection', selection => selection.setInterceptor('onSelectRecords', this._onSelectRecords));
    }

    public getMaxGroupLoadsPerSelection(): number {
        return this._settings.maxGroupLoadsPerSelection;
    }

    public isGroupSelectionLimitDialogOpen(): boolean {
        return this._isGroupSelectionLimitDialogOpen;
    }

    public closeGroupSelectionLimitDialog(): void {
        this._setGroupSelectionLimitDialogOpen(false);
    }

    /** Loads the groups a selection adds before it is written, within the limit. */
    private _onSelectRecords: IInterceptor<IGridRowSelectionInterceptors, 'onSelectRecords'> = async (parameters, defaultAction) => {
        //the provider selects a loaded group without fetching
        if (await this._loadNewlySelectedGroups(parameters.provider, parameters.recordIds)) {
            await defaultAction(parameters);
            return;
        }
        this._setGroupSelectionLimitDialogOpen(true);
    };

    /** Loads the groups the ids add to the selection, a level at a time, within the limit. */
    private async _loadNewlySelectedGroups(provider: IDataProvider, recordIds: string[]): Promise<boolean> {
        const selectedRecordIds = new Set(provider.getSelectedRecordIds({ includeGroupRecordIds: true, includeChildrenRecordIds: false }));
        const recordsMap = provider.getRecordsMap();
        let pendingGroups = recordIds
            .filter(recordId => !selectedRecordIds.has(recordId))
            .map(recordId => recordsMap[recordId])
            .filter(isUnloadedGroup);
        let remainingLoads = this._settings.maxGroupLoadsPerSelection;
        while (pendingGroups.length > 0) {
            if (pendingGroups.length > remainingLoads) {
                return false;
            }
            remainingLoads -= pendingGroups.length;
            const nextGroups: IRecord[] = [];
            for (let index = 0; index < pendingGroups.length; index += CONCURRENT_GROUP_LOADS) {
                const loadedRecords = await Promise.all(pendingGroups.slice(index, index + CONCURRENT_GROUP_LOADS).map(loadGroupRecords));
                nextGroups.push(...loadedRecords.flat().filter(isUnloadedGroup));
            }
            pendingGroups = nextGroups;
        }
        return true;
    }

    private _setGroupSelectionLimitDialogOpen(isOpen: boolean): void {
        this._isGroupSelectionLimitDialogOpen = isOpen;
        this.events.dispatchEvent('onGroupSelectionLimitDialogChanged');
    }

    private _onSurfaces = (surfaces: IGridSurface[]): void => {
        surfaces.push({ key: 'groupSelectionLimit', onRender: () => createElement(GroupSelectionLimitDialog) });
    };

    public getLabels(): ILocalizationService<IGridGroupingLabels> {
        return this._labels;
    }

    public isColumnGrouped(column: IColumn): boolean {
        return !!column.grouping?.isGrouped;
    }

    public canColumnBeGrouped(column: IColumn): boolean {
        return this._settings.allowUserGrouping
            && !!column.metadata?.CanBeGrouped
            && column.dataType !== DataTypes.MultiSelectOptionSet;
    }

    public isGroupRow(node: IRowNode<IRecord>): boolean {
        return !!node.data?.getRecordId().startsWith(DataProvider.CONST.GROUP_PREFIX);
    }

    public getGroupedValueColumnName(record: IRecord, columnName: string): string {
        const alias = this._provider.getColumnsMap()[columnName]?.grouping?.alias;
        return alias && record.getDataProvider().getColumnsMap()[alias] ? alias : columnName;
    }

    public getGroupedCount(record: IRecord, columnName: string): number | undefined {
        const aggregation = this._provider.getColumnsMap()[columnName]?.aggregation;
        if ((aggregation?.aggregationFunction !== 'count' && aggregation?.aggregationFunction !== 'countcolumn') || !aggregation.alias) {
            return undefined;
        }
        const count = record.getValue(aggregation.alias);
        return count == null ? undefined : Number(count);
    }

    public isColumnExpandable(record: IRecord, columnName: string): boolean {
        return this._getRowGroupBys(record)[0]?.columnName === columnName;
    }

    public isRowGroupedBy(record: IRecord, columnName: string): boolean {
        return this._getRowGroupBys(record).some(groupBy => groupBy.columnName === columnName);
    }

    //a nested grouping's rows stand for its first group-by only
    private _getRowGroupBys(record: IRecord): IGroupByMetadata[] {
        const provider = record.getDataProvider();
        const columnsMap = provider.getColumnsMap();
        const groupBys = provider.grouping.getGroupBys()
            .sort((left, right) => (columnsMap[left.columnName]?.order ?? 0) - (columnsMap[right.columnName]?.order ?? 0));
        return this._settings.type === 'flat' ? groupBys : groupBys.slice(0, 1);
    }

    public getExpandedLevel(): number {
        //a level deeper than the grouping now has reads as the deepest there is
        return Math.min(this._expandedLevel, this.getDeepestLevel());
    }

    public getDeepestLevel(): number {
        const groupByCount = this._provider.grouping.getGroupBys().length;
        return this._settings.type === 'flat' ? Math.min(groupByCount, 1) - 1 : groupByCount - 1;
    }

    public setExpandedLevel(level: number): void {
        this._expandedLevel = Math.min(Math.max(level, -1), this.getDeepestLevel());
        this._rowModelGrouping?.onExpansionChanged();
        this._hasUserExpanded = false;
        const gridApi = this._gridServices.find('gridApi');
        if (!gridApi) {
            return;
        }
        this._rowModelGrouping?.onApplyExpandedLevel(gridApi);
    }

    public toggleGroup(node: IRowNode<IRecord>): void {
        node.setExpanded(!node.expanded);
        this._rowModelGrouping?.onExpansionChanged();
        this._hasUserExpanded = true;
    }

    public toggleColumnGroup(columnName: string): void {
        const provider = this._provider;
        (provider as IInternalDataProvider).executeWithUnsavedChangesBlocker(() => {
            const column = provider.getColumnsMap()[columnName]!;
            if (column.grouping?.isGrouped) {
                this._grouping.ungroupColumn(column.grouping.alias!);
            }
            else {
                this._grouping.groupColumn(column.name);
            }
            provider.refresh();
        });
    }

    /** Moves grouped columns to the front and pins them if asked. */
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const columnsMap = this._provider.getColumnsMap();
        const isGrouped = (colDef: ColDef<IRecord>): boolean => !!columnsMap[colDef.colId ?? colDef.field ?? '']?.grouping?.isGrouped;
        for (const colDef of columnDefs.filter(isGrouped)) {
            const columnName = colDef.colId ?? colDef.field!;
            colDef.valueGetter = params => this._getGroupedValue(params.data, columnName);
            colDef.valueFormatter = params => this._getGroupedFormattedValue(params.data, columnName);
            //a group's value is not edited in place
            colDef.settings = { ...colDef.settings, cell: { ...colDef.settings?.cell, oneClickEdit: false }, widthOffset: GROUPED_COLUMN_WIDTH_OFFSET };
            if (this._settings.pinGroupedColumns) {
                colDef.pinned = 'left';
            }
        }
        for (const colDef of columnDefs.filter(colDef => !!columnsMap[colDef.colId ?? colDef.field ?? ''])) {
            this._applyGroupRowRenderer(colDef, columnsMap[colDef.colId ?? colDef.field!]);
            this._rowModelGrouping?.onApplyColumnDefinition(colDef, isGrouped(colDef));
            //AG Grid keeps a pin that a new definition leaves out
            if (!isGrouped(colDef)) {
                colDef.pinned ??= null;
            }
        }
        //grouped columns first so the hierarchy reads left to right
        columnDefs.sort((left, right) => Number(isGrouped(right)) - Number(isGrouped(left)));
        //nothing to open while nothing is grouped
        if (columnDefs.some(isGrouped)) {
            columnDefs.push(getGroupExpansionColumnDefinition());
        }
    };

    /** Styles a group row as the heading of what it holds. */
    private _onCellTheme = (theme: ThemeBuilder, params: { record: IRecord; columnName: string }): void => {
        //unstyled until something is grouped
        if (this._provider.grouping.getGroupBys().length === 0) {
            return;
        }
        if (params.record.getDataProvider().getSummarizationType() === 'grouping') {
            theme.colors.background = this._gridTheme.palette.neutralLighterAlt;
            theme.edit('grouping|groupRow', result => { result.fonts.medium.fontWeight = FontWeights.semibold; });
            return;
        }
        //a record sits on the grid's own surface
        theme.colors.background = this._gridTheme.semanticColors.bodyBackground;
    };


    /** A group row holds no record's value to edit. */
    //per cell: locking the group record would draw its row muted
    private _onEditable: GridEditableHook = (result, { record, columnName }) => {
        if (!record || !columnName || !record.getRecordId().startsWith(DataProvider.CONST.GROUP_PREFIX)) {
            return;
        }
        result.isEditable = false;
    };

    /** The grouping icon on a column the rows are grouped by. */
    private _onColumnHeaderAdornments = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
        if (!column || !this.isColumnGrouped(column)) {
            return;
        }
        adornments.push({
            key: 'grouping',
            placement: 'prefix',
            title: this._labels.getLocalizedString('headerTitle'),
            onRender: () => ({ ...GridGroupingIconComponents, ...this.components.groupingIcon }).onRenderIcon({ iconName: 'GroupList' }),
        });
    };

    /** What a column's menu offers: grouping by it, or ungrouping it. */
    private _onMenuSection = (sections: IColumnMenuSection[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
        if (!column || !this.canColumnBeGrouped(column)) {
            return;
        }
        const isGrouped = this.isColumnGrouped(column);
        sections.push({
            key: 'grouping',
            title: this._labels.getLocalizedString('menuSection'),
            items: [{
                key: 'group',
                text: this._labels.getLocalizedString(isGrouped ? 'ungroup' : 'group'),
                iconProps: { iconName: isGrouped ? 'ViewList' : 'GroupList' },
                onClick: () => this.toggleColumnGroup(column.name),
            }],
        });
    };

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onNestedProviderPagingLimitReached', this._onNestedProviderPagingLimitReached);
        this._provider.removeEventListener('onNewDataLoaded', this._onNewDataLoaded);
    };

    //each new load reports the child limit again
    private _onNewDataLoaded = (): void => {
        this._hasReportedChildLimit = false;
    };

    /** Says once per load that a group had more children than were loaded. */
    private _onNestedProviderPagingLimitReached = (): void => {
        if (this._hasReportedChildLimit) {
            return;
        }
        this._hasReportedChildLimit = true;
        this._gridServices.get('pcfContext').navigation.openErrorDialog({
            message: this._labels.getLocalizedString('maximumGroupChildrenLimitReached', {
                maxGroupChildren: Formatting.Get().formatInteger(CHILD_LIMIT),
            }),
        });
    };


    /** What a row draws in a column while the grid is grouped: the group's value, or nothing. */
    private _applyGroupRowRenderer(colDef: ColDef<IRecord>, column: IColumn): void {
        const cellRendererSelector = colDef.cellRendererSelector;
        colDef.cellRendererSelector = params => {
            if (!params.data || !this.isGroupRow(params.node)) {
                //a grouped column's value lives in the group rows above the record
                return this.isColumnGrouped(column) ? { component: CellEmptyRenderer } : cellRendererSelector?.(params);
            }
            return this.isRowGroupedBy(params.data, column.name) ? { component: GroupCell } : { component: CellEmptyRenderer };
        };
    }

    /** The value a row holds for a grouped column. */
    private _getGroupedValue(record: IRecord | undefined, columnName: string): any {
        return record ? record.getValue(this.getGroupedValueColumnName(record, columnName)) : null;
    }

    private _getGroupedFormattedValue(record: IRecord | undefined, columnName: string): string {
        return record ? record.getFormattedValue(this.getGroupedValueColumnName(record, columnName)) ?? '' : '';
    }

    private _isGroupOpenByDefault = (node: IRowNode<IRecord>): boolean => !this._hasUserExpanded && node.level <= this._expandedLevel;

    public get components(): IGridGroupingComponents {
        return this._services.get('components');
    }

    private get _labels(): ILocalizationService<IGridGroupingLabels> {
        return this._services.get('labels');
    }

    private get _gridServices() {
        return this._services.get('gridServices');
    }

    private get _provider() {
        return this._gridServices.get('provider');
    }

    private get _gridTheme() {
        return this._gridServices.get('theme');
    }


}

/** A group whose own records have not been loaded yet. */
const isUnloadedGroup = (record: IRecord | undefined): record is IRecord =>
    !!record
    && record.getSummarizationType() === 'grouping'
    && !record.getDataProvider().getGroupedRecordDataProvider(record.getRecordId())?.getRecords().length;

/** Loads a group's own records, or none where the load fails. */
const loadGroupRecords = async (group: IRecord): Promise<IRecord[]> => {
    const childProvider = group.getDataProvider().createGroupedRecordDataProvider(group);
    try {
        return await childProvider.refresh();
    }
    catch {
        return [];
    }
};
