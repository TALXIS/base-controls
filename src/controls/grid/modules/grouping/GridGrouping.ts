import { ColDef, ICellRendererParams, IRowNode } from "@ag-grid-community/core";
import { IContextualMenuItem } from "@fluentui/react";
import { DataProvider, DataTypes, Formatting, Grouping, IColumn, IGroupByMetadata, IInternalDataProvider, IRecord } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridGroupingLabels } from "./labels";
import { IGridGroupingComponents } from "./moduleComponents";
import { IColumnHeaderParams } from "../../components/column-header/root/ColumnHeaderRoot";
import { GridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridGroupingServiceLocator } from "./services";
import { getGroupExpansionColumnDefinition } from "./getGroupExpansionColumnDefinition";
import { IGroupingStrategy, IGroupingStrategyModule } from "./strategies";

/** How many children a group loads before it stops and says so. */
const CHILD_LIMIT = 5000;

export interface IGroupingSettings {
    /** Whether a column's menu offers grouping, or the dataset's own group-bys are all there is. */
    allowUserGrouping: boolean;
    /** How deep the groups nest */
    type: 'nested' | 'flat';
    /** How many levels open themselves. */
    defaultExpandedLevel: number;
    /** Whether a grouped column is pinned to the left. */
    pinGroupedColumns: boolean;
}

export interface IGridGroupingParameters {
    /** This module's own locator. */
    services: IGridGroupingServiceLocator;
    /** Where a group's children come from. */
    strategy: IGroupingStrategyModule;
    settings: IGroupingSettings;
}

/**
 * Grouping the rows by a column.
 *
 * children come from is the row model's, which {@link IGroupingStrategy}
 */
export class GridGrouping {
    private _services: IGridGroupingServiceLocator;
    private _settings: IGroupingSettings;
    private _grouping: Grouping;
    private _strategy: IGroupingStrategy;
    /** How many levels of groups are open. */
    private _expandedLevel: number;
    private _expandedRowGroupIds: Set<string> = new Set();
    private _hasUserExpanded: boolean = false;
    private _childLimitNotificationId?: string;

    constructor(parameters: IGridGroupingParameters) {
        this._services = parameters.services;
        this._settings = parameters.settings;
        this._expandedLevel = parameters.settings.defaultExpandedLevel;
        this._grouping = new Grouping(this._provider);
        //before the strategy, so a strategy of its own listening for a load is behind this
        this._interceptNestedGrouping();
        this._strategy = parameters.strategy.create({ services: this._services });
        //ahead of `AgGridModel`, which registers its own listener only once there is an api
        this._gridServices.whenAvailable('gridApi', gridApi => this._strategy.applyGridOptions(gridApi));
        //only a grouped provider has children to run out of
        this._provider.addEventListener('onNestedProviderPagingLimitReached', () => this._warnChildLimitReached());
    }

    /** The strings this module renders, for its own components. */
    public getLabels(): ILocalizationService<IGridGroupingLabels> {
        return this._labels;
    }

    /**
     * The rows the grid is given, where the row model takes data rather than a level at a time.
     */
    public getRows(): IRecord[] | undefined {
        return this._strategy.getRows();
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
        if (aggregation?.aggregationFunction !== 'count' || !aggregation.alias) {
            return undefined;
        }
        const count = record.getValue(aggregation.alias);
        return count == null ? undefined : Number(count);
    }

    /** Whether a row's cell in this column carries the chevron that opens it. */
    public isColumnExpandable(record: IRecord, column: IColumn): boolean {
        return record.getDataProvider().grouping.getGroupBys()[0]?.columnName === column.name;
    }

    /** Whether a group row opens itself */
    public isGroupOpenByDefault(node: IRowNode<IRecord>): boolean {
        if (node.id && this._expandedRowGroupIds.has(node.id)) {
            return true;
        }
        if (this._hasUserExpanded) {
            return false;
        }
        return node.level <= this._expandedLevel;
    }

    /** How many levels of groups are open. */
    public getExpandedLevel(): number {
        return this._expandedLevel;
    }

    /** The deepest level there is to open, which is the innermost group-by. */
    public getDeepestLevel(): number {
        return this._provider.grouping.getGroupBys().length - 1;
    }

    /** Opens the groups down to a level and closes the rest. */
    public setExpandedLevel(level: number): void {
        this._expandedLevel = Math.min(Math.max(level, -1), this.getDeepestLevel());
        //the level is the authority from here
        this._expandedRowGroupIds.clear();
        this._hasUserExpanded = false;
        const gridApi = this._gridServices.find('gridApi');
        if (!gridApi) {
            return;
        }
        gridApi.forEachNode(node => {
            if (this.isGroupRow(node)) {
                node.setExpanded(node.level <= this._expandedLevel);
            }
        });
        this._gridServices.get('rowModel').applyExpansionChange(gridApi);
    }

    /** What was open before a purge, so the levels the user had opened come back. */
    public captureExpandedRowGroupIds(expandedRowGroupIds: string[]): void {
        this._expandedRowGroupIds = new Set(expandedRowGroupIds);
    }

    public toggleGroup(node: IRowNode<IRecord>): void {
        node.setExpanded(!node.expanded);
        //cleared so it does not force the next group open again
        this._expandedRowGroupIds.clear();
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
    public applyColumnDefinitions(columnDefs: ColDef<IRecord>[]): void {
        const columnsMap = this._provider.getColumnsMap();
        const isGrouped = (colDef: ColDef<IRecord>): boolean => !!columnsMap[colDef.colId ?? colDef.field ?? '']?.grouping?.isGrouped;
        for (const colDef of columnDefs.filter(isGrouped)) {
            const columnName = colDef.colId ?? colDef.field!;
            this._strategy.applyGroupedColumnDefinition(colDef);
            colDef.cellRenderer = this._onRenderGroupCell;
            colDef.valueGetter = params => this._getGroupedValue(params.data, columnName);
            colDef.valueFormatter = params => this._getGroupedFormattedValue(params.data, columnName);
            if (this._settings.pinGroupedColumns) {
                colDef.pinned = 'left';
            }
        }
        //grouped columns first, so the hierarchy reads left to right
        columnDefs.sort((left, right) => Number(isGrouped(right)) - Number(isGrouped(left)));
        //nothing to open while nothing is grouped, and a column of empty cells is worse than none
        if (columnDefs.some(isGrouped)) {
            columnDefs.push(getGroupExpansionColumnDefinition(this._onRenderExpansionHeader));
        }
    }

    /** The grouping icon and what it stands for, while the column is what the rows are grouped */
    public applyColumnHeaderAdornments(adornments: IColumnHeaderAdornment[], header: GridColumnHeader): void {
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
    }

    /** What a column's menu offers: grouping by it, or ungrouping it. */
    public applyMenuSection(sections: IColumnMenuSection[], header: GridColumnHeader): void {
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
    }

    /** Keeps a nested grouping to one level while a load runs, and puts the rest back after. */
    private _interceptNestedGrouping(): void {
        if (this._settings.type === 'flat') {
            return;
        }
        const provider = this._provider;
        let originalGrouping: IGroupByMetadata[] = [];
        let originalAggregation: IGroupByMetadata[] = [];
        provider.addEventListener('onBeforeNewDataLoaded', () => {
            originalGrouping = provider.grouping.getGroupBys().sort((left, right) => {
                const columnsMap = provider.getColumnsMap();
                return columnsMap[left.columnName]!.order! - columnsMap[right.columnName]!.order!;
            });
            originalAggregation = provider.aggregation.getAggregations();
            if (originalGrouping.length <= 1) {
                return;
            }
            provider.grouping.clear();
            provider.grouping.addGroupBy(originalGrouping[0]);
            for (const groupBy of originalGrouping.slice(1)) {
                const column = provider.getColumnsMap()[groupBy.columnName];
                provider.aggregation.removeAggregation(column?.aggregation?.alias!);
            }
        });
        provider.addEventListener('onNewDataLoaded', () => {
            originalGrouping.forEach(groupBy => provider.grouping.addGroupBy(groupBy));
            originalAggregation.forEach(aggregation => provider.aggregation.addAggregation(aggregation as any));
        });
    }

    /** Clears the notification it may have raised, so it does not outlive the grid. */
    public destroy(): void {
        if (this._childLimitNotificationId) {
            window.Xrm.App.clearGlobalNotification(this._childLimitNotificationId);
        }
    }

    /** Says once that a group had more children than were loaded. */
    //TODO: use control notification instead
    private async _warnChildLimitReached(): Promise<void> {
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
    }


    /** What a group row holds, which is the value the group stands for rather than the column's own. */
    private _getGroupedValue(record: IRecord | undefined, columnName: string): any {
        return record ? record.getValue(this.getGroupedValueColumnName(record, columnName)) : null;
    }

    private _getGroupedFormattedValue(record: IRecord | undefined, columnName: string): string {
        return record ? record.getFormattedValue(this.getGroupedValueColumnName(record, columnName)) ?? '' : '';
    }

    //the render methods reached through a field of ours.
    private _onRenderGroupCell = (props: ICellRendererParams<IRecord>): JSX.Element => this.components.onRenderGroupCell(props);

    private _onRenderExpansionHeader = (props: IColumnHeaderParams): JSX.Element => this.components.onRenderExpansionHeader(props);

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


}
