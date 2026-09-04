import { ColDef, IRowNode } from "@ag-grid-community/core";
import { IContextualMenuItem } from "@fluentui/react";
import { DataProvider, DataTypes, Formatting, Grouping, IColumn, IGroupByMetadata, IInternalDataProvider, IRecord } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridGroupingLabels } from "./labels";
import { IGridGroupingComponents } from "./moduleComponents";
import { IGridColumnHeaderAdornment, IGridColumnMenuSection } from "../../grid/column-header";
import { IGridColumn } from "../../grid/columns";
import { IGridGroupingServiceLocator } from "./services";
import { getGroupExpansionColumnDefinition } from "./getGroupExpansionColumnDefinition";
import { IGroupingStrategy, IGroupingStrategyModule } from "./strategies";

/** How many children a group loads before it stops and says so. */
const CHILD_LIMIT = 5000;

export interface IGroupingSettings {
    /** Whether a column's menu offers grouping, or the dataset's own group-bys are all there is. */
    allowUserGrouping: boolean;
    /** How deep the groups nest: `'nested'` opens a level at a time, `'flat'` groups by one column. */
    type: 'nested' | 'flat';
    /** How many levels open themselves. `-1` for none. */
    defaultExpandedLevel: number;
    /** Whether a grouped column is pinned to the left. */
    pinGroupedColumns: boolean;
}

export interface IGridGroupingParameters {
    /** This module's own locator, which is what everything inside it reaches through. */
    services: IGridGroupingServiceLocator;
    /** Where a group's children come from, which is what the caller's row model decides. */
    strategy: IGroupingStrategyModule;
    settings: IGroupingSettings;
}

/**
 * Grouping the rows by a column.
 *
 * The groups are the dataset's: a group row's children come from a provider of their own. Where those
 * children come from is the one thing the row model decides, and that is what {@link IGroupingStrategy}
 * holds — everything here is the same on both.
 */
export class GridGrouping {
    private _services: IGridGroupingServiceLocator;
    private _settings: IGroupingSettings;
    private _grouping: Grouping;
    private _strategy: IGroupingStrategy;
    /** How many levels of groups are open. `-1` is none, and it is what the header steps. */
    private _expandedLevel: number;
    private _expandedRowGroupIds: Set<string> = new Set();
    private _hasUserExpanded: boolean = false;
    private _childLimitNotificationId?: string;

    constructor(parameters: IGridGroupingParameters) {
        this._services = parameters.services;
        this._settings = parameters.settings;
        this._expandedLevel = parameters.settings.defaultExpandedLevel;
        this._grouping = new Grouping(this._provider);
        //before the strategy, so a strategy of its own listening for a load is behind this: what the
        //levels are put back to is what a child provider groups its own records by
        this._interceptNestedGrouping();
        this._strategy = parameters.strategy.create({ services: this._services });
        //ahead of `AgGridModel`, which registers its own listener only once there is an api - so whatever
        //the strategy needs on the grid is on it before the first rows are pushed
        this._gridServices.whenAvailable('gridApi', gridApi => this._strategy.applyGridOptions(gridApi));
        //only a grouped provider has children to run out of
        this._provider.addEventListener('onNestedProviderPagingLimitReached', () => this._warnChildLimitReached());
    }

    /** The strings this module renders, for its own components. */
    public getLabels(): ILocalizationService<IGridGroupingLabels> {
        return this._labels;
    }

    /**
     * The rows the grid is to be given, where the row model takes them as data rather than asking for a
     * level at a time.
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

    /**
     * Whether the row stands for a group rather than for a record.
     *
     * The record's own id, which is how the dataset itself tells the two apart. Not the provider's
     * summarization type: a leaf's provider carries a group-by of its own whenever there is a level below
     * it, so that reads as a group for rows that are records. And not AG Grid's `group` flag either, which
     * is set on the server-side model and never under `treeData`.
     */
    public isGroupRow(node: IRowNode<IRecord>): boolean {
        return !!node.data?.getRecordId().startsWith(DataProvider.CONST.GROUP_PREFIX);
    }

    /**
     * Whether a row's cell in this column carries the chevron that opens it.
     *
     * The outermost group-by only: a row stands for one group, and that group is named by the column it was
     * grouped on first.
     */
    public isColumnExpandable(record: IRecord, column: IColumn): boolean {
        return record.getDataProvider().grouping.getGroupBys()[0]?.columnName === column.name;
    }

    /** Whether a group row opens itself: what was open before a reload, else the level that is open. */
    public isGroupOpenByDefault(node: IRowNode<IRecord>): boolean {
        if (node.id && this._expandedRowGroupIds.has(node.id)) {
            return true;
        }
        if (this._hasUserExpanded) {
            return false;
        }
        return node.level <= this._expandedLevel;
    }

    /** How many levels of groups are open. `-1` is none. */
    public getExpandedLevel(): number {
        return this._expandedLevel;
    }

    /** The deepest level there is to open, which is the innermost group-by. */
    public getDeepestLevel(): number {
        return this._provider.grouping.getGroupBys().length - 1;
    }

    /**
     * Opens the groups down to a level and closes the rest.
     *
     * Every node with children rather than every group row the grid happens to have drawn — on the
     * server-side model that is the levels already fetched, and a group opened here fetches its own
     * children, which then read this same level and open in turn.
     */
    public setExpandedLevel(level: number): void {
        this._expandedLevel = Math.min(Math.max(level, -1), this.getDeepestLevel());
        //the level is the authority from here: what the user had opened by hand would otherwise keep
        //overriding it
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

    /**
     * Moves a grouped column to the front, pins it if asked, and adds the column the levels are opened
     * from.
     *
     * The grid builds definitions that know nothing of groups; this is the whole of what grouping needs
     * on them, bar what the row model decides.
     */
    public applyColumnDefinitions(columnDefs: ColDef<IRecord>[]): void {
        const columnsMap = this._provider.getColumnsMap();
        const isGrouped = (colDef: ColDef<IRecord>): boolean =>
            !!columnsMap[colDef.colId ?? colDef.field ?? '']?.grouping?.isGrouped;
        for (const colDef of columnDefs.filter(isGrouped)) {
            this._strategy.applyGroupedColumnDefinition(colDef);
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

    /** The grouping icon and what it stands for, while the column is what the rows are grouped by. */
    public applyColumnHeaderAdornments(adornments: IGridColumnHeaderAdornment[], column: IGridColumn): void {
        if (!this.isColumnGrouped(column)) {
            return;
        }
        adornments.push({
            key: 'grouping',
            placement: 'prefix',
            title: this._labels.getLocalizedString('headerTitle'),
            onRender: () => this.components.onRenderGroupingIcon(),
        });
    }

    /** What a column's menu offers: grouping by it, or ungrouping it. */
    public applyMenuSection(sections: IGridColumnMenuSection[], column: IGridColumn): void {
        if (!this.canColumnBeGrouped(column)) {
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

    /**
     * Keeps a nested grouping to one level while a load runs, and puts the rest back after.
     *
     * The provider groups by everything it is told to at once, which for nested grouping is the wrong
     * shape: only the outermost level is asked for up front, and the rest arrive per group. So the extra
     * levels — and the aggregations that belong to them — are taken off for the duration of the load.
     */
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

    /**
     * Says once that a group had more children than were loaded.
     *
     * Once per grid: the limit is reached per group, and a notification per group would bury the point.
     */
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


    //the render method reached through a field of ours, rather than handed to AG Grid directly: what it
    //gets has to keep one identity, and a component whose identity changed is one it rebuilds
    private _onRenderExpansionHeader = (): JSX.Element => this.components.onRenderExpansionHeader();

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
