import { ColDef } from "@ag-grid-community/core";
import { Icon, IContextualMenuItem } from "@fluentui/react";
import { FieldValue, Filtering, IColumn, IInternalDataProvider, IRecord, Type as FilterType, EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridFilteringLabels } from "./labels";
import { IGridFilteringComponents } from "./moduleComponents";
import { GridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridFilteringServiceLocator } from "./services";

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
export class GridFiltering {
    private _services: IGridFilteringServiceLocator;
    private _filtering: Filtering;
    public readonly events: IEventEmitter<IGridFilteringEvents> = new EventEmitter<IGridFilteringEvents>();
    private _openColumnName?: string;
    private _openTarget?: HTMLElement;

    constructor(parameters: IGridFilteringParameters) {
        this._services = parameters.services;
        this._filtering = new Filtering(this._provider, FieldValue);
    }

    /** The strings this module renders, for its own components. */
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

    /** Which column's filter callout is open, if any. */
    public getOpenColumnName(): string | undefined {
        return this._openColumnName;
    }

    /** What the open filter is drawn against: the header it was opened from. */
    public getOpenTarget(): HTMLElement | undefined {
        return this._openTarget;
    }

    /** @param target What to draw the filter against, where the caller knows. */
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
    public applyColumnDefinitions(columnDefs: ColDef<IRecord>[]): void {
        for (const colDef of columnDefs) {
            const columnName = colDef.colId ?? colDef.field;
            const column = columnName ? this._provider.getColumnsMap()[columnName] : undefined;
            if (column) {
                colDef.filter = this.isColumnFilterable(column);
            }
        }
    }

    /** What a column's menu offers: opening the filter, and clearing it. */
    public applyMenuSection(sections: IColumnMenuSection[], header: GridColumnHeader): void {
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
    }

    /** The funnel, while a filter is applied to the dataset. */
    public applyColumnHeaderAdornments(adornments: IColumnHeaderAdornment[], header: GridColumnHeader): void {
        const column = header.getColumn();
        if (!column || !this.isFiltered(column)) {
            return;
        }
        adornments.push({
            key: 'filter',
            placement: 'suffix',
            onRender: () => this.components.onRenderFilterIcon({ iconName: 'Filter' }),
        });
    }


    private _withUnsavedChangesBlocker(write: () => void): void {
        (this._provider as IInternalDataProvider).executeWithUnsavedChangesBlocker(write);
    }

    private get _provider() {
        return this._services.get('gridServices').get('provider');
    }

    /** The parts this module renders, merged with whatever the caller replaced. */
    public get components(): IGridFilteringComponents {
        return this._services.get('components');
    }

    private get _labels(): ILocalizationService<IGridFilteringLabels> {
        return this._services.get('labels');
    }
}
