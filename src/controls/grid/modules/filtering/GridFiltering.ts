import { createElement } from "react";
import { ColDef } from "@ag-grid-community/core";
import { IContextualMenuItem } from "@fluentui/react";
import { ColumnFilter, DataTypes, FieldValue, Filtering, IColumn, IInternalDataProvider, IRecord, Type as FilterType, EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { HookRegistry, ILocalizationService } from "@utils";
import { IParameters } from "@interfaces";
import { IGridFilteringLabels } from "./labels";
import { GridFilteringIconComponents, IGridFilteringComponents } from "./moduleComponents";
import { FilterCalloutHost } from "./components/filter-callout-host/FilterCalloutHost";
import { IGridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridFilteringServiceLocator } from "./services";
import { IGridSurface } from "../../services/surfaces";
import { GRID_MODULE_PRIORITY } from "../priorities";

declare module "../../services/interfaces" {
    interface IGridModuleServiceMap {
        /** Filtering the grid by a column. */
        filtering: IGridFiltering;
    }
}

/** What changed about the filter a column header has open. */
export interface IGridFilteringEvents {
    /** A column's filter was opened. */
    onFilterOpened: (columnName: string) => void;
    /** Whatever was open was closed. */
    onFilterClosed: () => void;
}

const LOOKUP_DATA_TYPES = new Set<string>(['Lookup.Customer', 'Lookup.Owner', 'Lookup.Regarding', 'Lookup.Simple']);

/** Which of a column's filter controls the parameters are for. */
export type GridFilterControl = 'operator' | 'value';

/** A hook over the parameters a filter control is handed. */
export type GridFilterControlParametersHook = (result: IParameters, params: {
    column: IColumn;
    control: GridFilterControl;
    /** Which value control, where an operator such as between takes two. */
    index: number;
}) => void;

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
    /**
     * Registers a hook over the parameters the filter callout's controls are handed.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerFilterControlParametersHook(hook: GridFilterControlParametersHook, priority?: number): () => void;
    /** The parameters a filter control is handed: the ones it came with, the grid's defaults, then the hooks. */
    getFilterControlParameters(parameters: IParameters, params: Parameters<GridFilterControlParametersHook>[1]): IParameters;
    /** The parts of what this module draws, as the caller replaced them. */
    readonly components: IGridFilteringComponents;
}

export class GridFiltering implements IGridFiltering {
    private _services: IGridFilteringServiceLocator;
    private _filtering: Filtering;
    public readonly events: IEventEmitter<IGridFilteringEvents> = new EventEmitter<IGridFilteringEvents>();
    private _openColumnName?: string;
    private _openTarget?: HTMLElement;
    private _filterControlParametersHooks = new HookRegistry<GridFilterControlParametersHook>();

    constructor(parameters: IGridFilteringParameters) {
        this._services = parameters.services;
        this._filtering = new Filtering(this._provider, FieldValue);
        this._registerHooks();
    }

    public registerFilterControlParametersHook(hook: GridFilterControlParametersHook, priority?: number): () => void {
        return this._filterControlParametersHooks.register(hook, priority);
    }

    public getFilterControlParameters(parameters: IParameters, params: Parameters<GridFilterControlParametersHook>[1]): IParameters {
        const result = { ...parameters };
        if (params.control === 'value') {
            Object.assign(result, this._getDefaultValueControlParameters(result, params.column));
        }
        this._filterControlParametersHooks.apply(result, params);
        return result;
    }

    private _getDefaultValueControlParameters(parameters: IParameters, column: IColumn): IParameters {
        const result: IParameters = {
            EnableOptionSetColors: { raw: this._services.get('gridServices').get('settings').areOptionSetColorsEnabled(), type: DataTypes.TwoOptions },
        };
        //a lookup filters among existing records and asks for one view type
        if (LOOKUP_DATA_TYPES.has(column.dataType) && parameters.value) {
            const originalGetAllViews = parameters.value.getAllViews;
            result.IsInlineNewEnabled = { raw: false };
            result.value = { ...parameters.value, getAllViews: (...args: any[]) => originalGetAllViews(...args, 1) };
        }
        return result;
    }

    private _registerHooks(): void {
        const gridServices = this._services.get('gridServices');
        gridServices.get('columns').registerColumnDefinitionsHook(this._onColumnDefinitions, GRID_MODULE_PRIORITY.filtering);
        //the callout is a surface over the grid
        gridServices.get('surfaces').registerSurfaceHook(this._onSurfaces, GRID_MODULE_PRIORITY.filtering);
        gridServices.get('columns').headers.registerColumnMenuSectionHook(this._onMenuSection, GRID_MODULE_PRIORITY.filtering);
        gridServices.get('columns').headers.registerColumnHeaderAdornmentsHook(this._onColumnHeaderAdornments, GRID_MODULE_PRIORITY.filtering);
    }

    private _onSurfaces = (surfaces: IGridSurface[]): void => {
        surfaces.push({ key: 'filterCallout', onRender: () => createElement(FilterCalloutHost) });
    };


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
            onRender: () => ({ ...GridFilteringIconComponents, ...this.components.filterIcon }).onRenderIcon({ iconName: 'Filter' }),
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
