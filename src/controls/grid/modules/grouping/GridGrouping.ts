import { ColDef, ICellRendererParams, IRowNode } from "@ag-grid-community/core";
import { FontWeights, IContextualMenuItem } from "@fluentui/react";
import { DataProvider, DataTypes, EventEmitter, Formatting, Grouping, IColumn, IEventEmitter, IGroupByMetadata, IDataProvider, IInternalDataProvider, IInterceptor, IRecord } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { ThemeBuilder } from "@theme";
import { IGridCellEditable } from "../../services/cells";
import { IGridGroupingLabels } from "./labels";
import { IGridGroupingComponents } from "./moduleComponents";
import { IColumnHeaderParams } from "../../components/column-header/root/ColumnHeaderRoot";
import { GridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridGroupingServiceLocator } from "./services";
import { getGroupExpansionColumnDefinition } from "./getGroupExpansionColumnDefinition";
import { CellEmptyRenderer } from "../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { IGridRowModelGrouping } from "../row-model/interfaces";
import { IGridSurface } from "../../services/surfaces";
import { IGridSelectionInterceptors } from "../selection";

/** How many children a group loads before it stops and says so. */
const CHILD_LIMIT = 5000;

/** How many groups load their records at the same time while a selection waits for them. */
const CONCURRENT_GROUP_LOADS = 5;

export interface IGridGroupingEvents {
    onGroupSelectionLimitDialogChanged: () => void;
}

export interface IGroupingSettings {
    /** Whether a column's menu offers grouping, or the dataset's own group-bys are all there is. */
    allowUserGrouping: boolean;
    /** How deep the groups nest */
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
export class GridGrouping {
    private _services: IGridGroupingServiceLocator;
    private _settings: IGroupingSettings;
    private _grouping: Grouping;
    private _rowModelGrouping: IGridRowModelGrouping;
    /** How many levels of groups are open. */
    private _expandedLevel: number;
    private _hasUserExpanded: boolean = false;
    private _childLimitNotificationId?: string;
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
        //the provider nests by default, so what this module was asked for is the word on it
        this._provider.setProperty('groupingType', this._settings.type);
        this._rowModelGrouping = this._gridServices.get('rowModel').createGrouping({ isGroupOpenByDefault: this._isGroupOpenByDefault });
        //ahead of `AgGridModel`, which registers its own listener only once there is an api
        this._gridServices.whenAvailable('gridApi', gridApi => {
            this._rowModelGrouping.onApplyGridOptions(gridApi);
            gridApi.addEventListener('gridPreDestroyed', this._onGridPreDestroyed);
        });
        //only a grouped provider has children to run out of
        this._provider.addEventListener('onNestedProviderPagingLimitReached', this._onNestedProviderPagingLimitReached);
        this._registerHooks();
    }

    /** What this module has to say about what the grid draws, in the order the grid asks. */
    private _registerHooks(): void {
        const cells = this._gridServices.get('cells');
        const columnHeaders = this._gridServices.get('columnHeaders');
        this._gridServices.get('columns').registerColumnDefinitionsHook(this._onColumnDefinitions, 20);
        cells.registerCellThemeHook(this._onCellTheme);
        cells.registerCellEditableHook(this._onCellEditable);
        //behind sorting and filtering, which a column's menu offers first
        columnHeaders.registerColumnMenuSectionHook(this._onMenuSection, 20);
        columnHeaders.registerColumnHeaderAdornmentsHook(this._onColumnHeaderAdornments, 20);
        this._gridServices.get('surfaces').registerSurfaceHook(this._onSurfaces);
        this._gridServices.find('selection')?.setInterceptor('onSelectRecords', this._onSelectRecords);
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

    /** Loads the groups a selection adds before it is written, and refuses one that would load too many. */
    private _onSelectRecords: IInterceptor<IGridSelectionInterceptors, 'onSelectRecords'> = async (parameters, defaultAction) => {
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
        surfaces.push({ key: 'groupSelectionLimit', onRender: this._onRenderGroupSelectionLimitDialog });
    };

    /** The strings this module renders, for its own components. */
    public getLabels(): ILocalizationService<IGridGroupingLabels> {
        return this._labels;
    }

    public getGrouping(): Grouping {
        return this._grouping;
    }

    public getType(): 'nested' | 'flat' {
        return this._settings.type;
    }

    public isColumnGrouped(column: IColumn): boolean {
        return !!column.grouping?.isGrouped;
    }

    public canColumnBeGrouped(column: IColumn): boolean {
        return this._settings.allowUserGrouping
            && !!column.metadata?.CanBeGrouped
            && column.dataType !== DataTypes.MultiSelectOptionSet;
    }

    /** Whether the row stands for a group rather than for a record. */
    public isGroupRow(node: IRowNode<IRecord>): boolean {
        return !!node.data?.getRecordId().startsWith(DataProvider.CONST.GROUP_PREFIX);
    }

    /** What a row holds a grouped column's value under: a group row holds it under the group-by's alias. */
    public getGroupedValueColumnName(record: IRecord, columnName: string): string {
        const alias = this._provider.getColumnsMap()[columnName]?.grouping?.alias;
        return alias && record.getDataProvider().getColumnsMap()[alias] ? alias : columnName;
    }

    /** How many records a group holds, where the column counts them rather than totalling something. */
    public getGroupedCount(record: IRecord, columnName: string): number | undefined {
        const aggregation = this._provider.getColumnsMap()[columnName]?.aggregation;
        if ((aggregation?.aggregationFunction !== 'count' && aggregation?.aggregationFunction !== 'countcolumn') || !aggregation.alias) {
            return undefined;
        }
        const count = record.getValue(aggregation.alias);
        return count == null ? undefined : Number(count);
    }

    /** Whether a row's cell in this column carries the chevron that opens it. */
    public isColumnExpandable(record: IRecord, columnName: string): boolean {
        return this._getRowGroupBys(record)[0]?.columnName === columnName;
    }

    /** Whether the row stands for this column too, which a flat grouping's row does for every group-by. */
    public isRowGroupedBy(record: IRecord, columnName: string): boolean {
        return this._getRowGroupBys(record).some(groupBy => groupBy.columnName === columnName);
    }

    //a nested grouping's top-level provider holds every group-by, while its rows stand for the first
    private _getRowGroupBys(record: IRecord): IGroupByMetadata[] {
        const provider = record.getDataProvider();
        const columnsMap = provider.getColumnsMap();
        const groupBys = provider.grouping.getGroupBys()
            .sort((left, right) => (columnsMap[left.columnName]?.order ?? 0) - (columnsMap[right.columnName]?.order ?? 0));
        return this._settings.type === 'flat' ? groupBys : groupBys.slice(0, 1);
    }

    /** How many levels of groups are open. */
    public getExpandedLevel(): number {
        return this._expandedLevel;
    }

    /** The deepest level there is to open, which is the innermost group-by. */
    public getDeepestLevel(): number {
        const groupByCount = this._provider.grouping.getGroupBys().length;
        return this._settings.type === 'flat' ? Math.min(groupByCount, 1) - 1 : groupByCount - 1;
    }

    /** Opens the groups down to a level and closes the rest. */
    public setExpandedLevel(level: number): void {
        this._expandedLevel = Math.min(Math.max(level, -1), this.getDeepestLevel());
        this._rowModelGrouping.onExpansionChanged();
        this._hasUserExpanded = false;
        const gridApi = this._gridServices.find('gridApi');
        if (!gridApi) {
            return;
        }
        this._rowModelGrouping.onApplyExpandedLevel(gridApi);
    }

    public toggleGroup(node: IRowNode<IRecord>): void {
        node.setExpanded(!node.expanded);
        this._rowModelGrouping.onExpansionChanged();
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

    /** Moves a grouped column to the front, pins it if asked */
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const columnsMap = this._provider.getColumnsMap();
        const isGrouped = (colDef: ColDef<IRecord>): boolean => !!columnsMap[colDef.colId ?? colDef.field ?? '']?.grouping?.isGrouped;
        for (const colDef of columnDefs.filter(isGrouped)) {
            const columnName = colDef.colId ?? colDef.field!;
            this._rowModelGrouping.onApplyGroupedColumnDefinition(colDef);
            colDef.valueGetter = params => this._getGroupedValue(params.data, columnName);
            colDef.valueFormatter = params => this._getGroupedFormattedValue(params.data, columnName);
            if (this._settings.pinGroupedColumns) {
                colDef.pinned = 'left';
            }
        }
        for (const colDef of columnDefs.filter(colDef => !!columnsMap[colDef.colId ?? colDef.field ?? ''])) {
            this._applyGroupRowRenderer(colDef, columnsMap[colDef.colId ?? colDef.field!]);
            //AG Grid keeps a pin that a new definition leaves out
            if (!isGrouped(colDef)) {
                colDef.pinned ??= null;
            }
        }
        //grouped columns first, so the hierarchy reads left to right
        columnDefs.sort((left, right) => Number(isGrouped(right)) - Number(isGrouped(left)));
        //nothing to open while nothing is grouped, and a column of empty cells is worse than none
        if (columnDefs.some(isGrouped)) {
            columnDefs.push(getGroupExpansionColumnDefinition(this._onRenderExpansionHeader));
        }
    };

    /** A group row reads as the heading of what it holds, so what it draws is bolder than a record's. */
    private _onCellTheme = (theme: ThemeBuilder, params: { record: IRecord; columnName: string }): void => {
        //the grid is what it was without grouping until something is grouped
        if (this._provider.grouping.getGroupBys().length === 0) {
            return;
        }
        if (params.record.getDataProvider().getSummarizationType() === 'grouping') {
            theme.colors.background = this._gridTheme.palette.neutralLighterAlt;
            theme.edit('grouping|groupRow', result => { result.fonts.medium.fontWeight = FontWeights.semibold; });
            return;
        }
        //a record sits on the grid's own surface, so what stands off it is the group above it
        theme.colors.background = this._gridTheme.semanticColors.bodyBackground;
    };

    /** A group row holds no record's value, so there is nothing in it to change. */
    private _onCellEditable = (result: IGridCellEditable, params: { record: IRecord; columnName: string }): void => {
        if (!params.record.getRecordId().startsWith(DataProvider.CONST.GROUP_PREFIX)) {
            return;
        }
        result.isEditable = false;
    };

    /** The grouping icon and what it stands for, while the column is what the rows are grouped */
    private _onColumnHeaderAdornments = (adornments: IColumnHeaderAdornment[], header: GridColumnHeader): void => {
        const column = header.getColumn();
        if (!column || !this.isColumnGrouped(column)) {
            return;
        }
        adornments.push({
            key: 'grouping',
            placement: 'prefix',
            title: this._labels.getLocalizedString('headerTitle'),
            onRender: () => this.components.onRenderGroupingIcon({ iconName: 'GroupList' }),
        });
    };

    /** What a column's menu offers: grouping by it, or ungrouping it. */
    private _onMenuSection = (sections: IColumnMenuSection[], header: GridColumnHeader): void => {
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
    private _onGridPreDestroyed = (): void => {
        this._provider.removeEventListener('onNestedProviderPagingLimitReached', this._onNestedProviderPagingLimitReached);
        if (this._childLimitNotificationId) {
            window.Xrm.App.clearGlobalNotification(this._childLimitNotificationId);
        }
    };

    /** Says once that a group had more children than were loaded. */
    //TODO: use control notification instead
    private _onNestedProviderPagingLimitReached = async (): Promise<void> => {
        if (this._childLimitNotificationId) {
            return;
        }
        this._childLimitNotificationId = await window.Xrm.App.addGlobalNotification({
            level: 4,
            message: this._labels.getLocalizedString('maximumGroupChildrenLimitReached', {
                maxGroupChildren: Formatting.Get().formatInteger(CHILD_LIMIT),
            }),
            type: 2,
        });
    };


    /** What a row draws in a column while the grid is grouped: the group's value, or nothing. */
    private _applyGroupRowRenderer(colDef: ColDef<IRecord>, column: IColumn): void {
        const cellRendererSelector = colDef.cellRendererSelector;
        colDef.cellRendererSelector = params => {
            if (!params.data || !this.isGroupRow(params.node)) {
                //a grouped column holds its value in the group rows above the record rather than in it
                return this.isColumnGrouped(column) ? { component: CellEmptyRenderer } : cellRendererSelector?.(params);
            }
            return this.isRowGroupedBy(params.data, column.name) ? { component: this._onRenderGroupCell } : { component: CellEmptyRenderer };
        };
    }

    /** What a group row holds, which is the value the group stands for rather than the column's own. */
    private _getGroupedValue(record: IRecord | undefined, columnName: string): any {
        return record ? record.getValue(this.getGroupedValueColumnName(record, columnName)) : null;
    }

    private _getGroupedFormattedValue(record: IRecord | undefined, columnName: string): string {
        return record ? record.getFormattedValue(this.getGroupedValueColumnName(record, columnName)) ?? '' : '';
    }

    private _isGroupOpenByDefault = (node: IRowNode<IRecord>): boolean => !this._hasUserExpanded && node.level <= this._expandedLevel;

    //the render methods reached through a field of ours.
    private _onRenderGroupCell = (props: ICellRendererParams<IRecord>): JSX.Element => this.components.onRenderGroupCell(props);

    private _onRenderExpansionHeader = (props: IColumnHeaderParams): JSX.Element => this.components.onRenderExpansionHeader(props);

    private _onRenderGroupSelectionLimitDialog = (): JSX.Element => this.components.onRenderGroupSelectionLimitDialog();

    /** The parts this module renders, merged with whatever the caller replaced. */
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
