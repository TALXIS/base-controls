import { ColDef } from "@ag-grid-community/core";
import { Icon, IContextualMenuItem } from "@fluentui/react";
import { ColumnFilter, FieldValue, Filtering, IColumn, IInternalDataProvider, IRecord, Type as FilterType, EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridFilteringLabels } from "./labels";
import { IGridFilteringComponents } from "./moduleComponents";
import { IGridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridFilteringServiceLocator } from "./services";
import { IGridSurface } from "../../services/surfaces";
import { GRID_MODULE_PRIORITY } from "../priorities";

/** What changed about the filter a column header has open. */
export interface IGridFilteringEvents {
    /** A column's filter was opened. */
    onFilterOpened: (columnName: string) => void;
    /** Whatever was open was closed. */
    onFilterClosed: () => void;
}

export interface IGridFilteringParameters {
    /** This module's own locator. */
    services: IGridFilteringServiceLocator;
}

/** Filtering the grid by a column. */
export interface IGridFiltering {
    readonly events: IEventEmitter<IGridFilteringEvents>;
    /** The strings this module renders, for its own components. */
    getLabels(): ILocalizationService<IGridFilteringLabels>;
    getFiltering(): Filtering;
    isColumnFilterable(column: IColumn): boolean;
    isFiltered(column: IColumn): boolean;
    getColumnFilter(columnName: string): ColumnFilter;
    removeColumnFilter(columnName: string, saveToDataset?: boolean): void;
    /** Which column's filter callout is open, if any. */
    getOpenColumnName(): string | undefined;
    /** What the open filter is drawn against: the header it was opened from. */
    getOpenTarget(): HTMLElement | undefined;
    /** @param target What to draw the filter against, where the caller knows. */
    openFilter(columnName: string, target?: HTMLElement): void;
    closeFilter(): void;
    /** The parts this module renders, merged with whatever the caller replaced. */
    readonly components: IGridFilteringComponents;
}

export class GridFiltering implements IGridFiltering {
    private _services: IGridFilteringServiceLocator;
    private _filtering: Filtering;
    public readonly events: IEventEmitter<IGridFilteringEvents> = new EventEmitter<IGridFilteringEvents>();
    private _openColumnName?: string;
    private _openTarget?: HTMLElement;

    constructor(parameters: IGridFilteringParameters) {
        this._services = parameters.services;
        this._filtering = new Filtering(this._provider, FieldValue);
        this._registerHooks();
    }

    private _registerHooks(): void {
        const gridServices = this._services.get('gridServices');
        gridServices.get('columns').registerColumnDefinitionsHook(this._onColumnDefinitions, GRID_MODULE_PRIORITY.filtering);
        //the callout is drawn over the grid rather than in the header it was opened from
        gridServices.get('surfaces').registerSurfaceHook(this._onSurfaces, GRID_MODULE_PRIORITY.filtering);
        gridServices.get('columns').headers.registerColumnMenuSectionHook(this._onMenuSection, GRID_MODULE_PRIORITY.filtering);
        gridServices.get('columns').headers.registerColumnHeaderAdornmentsHook(this._onColumnHeaderAdornments, GRID_MODULE_PRIORITY.filtering);
    }

    private _onSurfaces = (surfaces: IGridSurface[]): void => {
        surfaces.push({ key: 'filterCallout', onRender: this._onRenderFilterCallout });
    };

    private _onRenderFilterCallout = (): JSX.Element | null => this.components.onRenderFilterCallout();

    public getLabels(): ILocalizationService<IGridFilteringLabels> {
        return this._labels;
    }

    public getFiltering(): Filtering {
        return this._filtering;
    }

    public isColumnFilterable(column: IColumn): boolean {
        return (column.metadata?.SupportedFilterConditionOperators ?? []).length > 0;
    }

    public isFiltered(column: IColumn): boolean {
        return this._filtering.getColumnFilter(column.name).isAppliedToDataset();
    }

    public getColumnFilter(columnName: string) {
        return this._filtering.getColumnFilter(columnName);
    }

    public removeColumnFilter(columnName: string, saveToDataset?: boolean): void {
        this._filtering.removeColumnFilter(columnName);
        if (!saveToDataset) {
            return;
        }
        this._withUnsavedChangesBlocker(() => {
            const filterExpression = this._filtering.getFilterExpression(FilterType.And.Value);
            if (!filterExpression) {
                throw new Error('Unexpected error when clearing column filter.');
            }
            this._provider.setFiltering(filterExpression);
            this._provider.refresh();
        });
    }

    public getOpenColumnName(): string | undefined {
        return this._openColumnName;
    }

    public getOpenTarget(): HTMLElement | undefined {
        return this._openTarget;
    }

    public openFilter(columnName: string, target?: HTMLElement): void {
        this._openColumnName = columnName;
        this._openTarget = target;
        this.events.dispatchEvent('onFilterOpened', columnName);
    }

    public closeFilter(): void {
        this._openColumnName = undefined;
        this._openTarget = undefined;
        this.events.dispatchEvent('onFilterClosed');
    }

    /** Puts `filter` on the definitions. */
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        for (const colDef of columnDefs) {
            const columnName = colDef.colId ?? colDef.field;
            const column = columnName ? this._provider.getColumnsMap()[columnName] : undefined;
            if (column) {
                colDef.filter = this.isColumnFilterable(column);
            }
        }
    };

    /** What a column's menu offers: opening the filter, and clearing it. */
    private _onMenuSection = (sections: IColumnMenuSection[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
        if (!column || !this.isColumnFilterable(column)) {
            return;
        }
        const mine: IContextualMenuItem[] = [{
            key: 'filter',
            text: this._labels.getLocalizedString('filterMenuFilterBy'),
            iconProps: { iconName: 'Filter' },
            //the header the menu was opened from is what the filter is drawn against
            onClick: () => this.openFilter(column.name, header.getElement()),
        }];
        if (this.isFiltered(column)) {
            mine.push({
                key: 'clearFilter',
                text: this._labels.getLocalizedString('clear'),
                iconProps: { iconName: 'ClearFilter' },
                onClick: () => this.removeColumnFilter(column.name, true),
            });
        }
        sections.push({ key: 'filtering', title: this._labels.getLocalizedString('menuSection'), items: mine});
    };

    /** The funnel, while a filter is applied to the dataset. */
    private _onColumnHeaderAdornments = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
        if (!column || !this.isFiltered(column)) {
            return;
        }
        adornments.push({
            key: 'filter',
            placement: 'suffix',
            onRender: () => this.components.onRenderFilterIcon({ iconName: 'Filter' }),
        });
    };


    private _withUnsavedChangesBlocker(write: () => void): void {
        (this._provider as IInternalDataProvider).executeWithUnsavedChangesBlocker(write);
    }

    private get _provider() {
        return this._services.get('gridServices').get('provider');
    }

    public get components(): IGridFilteringComponents {
        return this._services.get('components');
    }

    private get _labels(): ILocalizationService<IGridFilteringLabels> {
        return this._services.get('labels');
    }
}
