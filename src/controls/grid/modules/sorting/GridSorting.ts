import { ColDef } from "@ag-grid-community/core";
import { Icon, IContextualMenuItem } from "@fluentui/react";
import { DataTypes, IColumn, IInternalDataProvider, IRecord, Sorting } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridSortingLabels } from "./labels";
import { IGridSortingComponents } from "./moduleComponents";
import { IGridColumnHeader, IColumnHeaderAdornment, IColumnMenuSection } from "../../services/column-header";
import { IGridSortingServiceLocator } from "./services";
import { GRID_MODULE_PRIORITY } from "../priorities";

export interface IGridSortingParameters {
    /** This module's own locator. */
    services: IGridSortingServiceLocator;
}

/** Sorting the grid by a column. */
export interface IGridSorting {
    getSorting(): Sorting;
    isColumnSortable(column: IColumn): boolean;
    isSorted(column: IColumn): boolean;
    isSortedDescending(column: IColumn): boolean;
    /** @param appendToExisting Adds to the sorting already applied rather than replacing it. */
    sortColumn(columnName: string, descending?: boolean, appendToExisting?: boolean): void;
    clearColumnSorting(columnName: string): void;
    /** What sorting a column reads as, which depends on what it holds. */
    getSortingLabel(columnName: string, descending?: boolean): string;
    /** The parts this module renders, merged with whatever the caller replaced. */
    readonly components: IGridSortingComponents;
}

export class GridSorting implements IGridSorting {
    private _services: IGridSortingServiceLocator;
    private _sorting: Sorting;

    constructor(parameters: IGridSortingParameters) {
        this._services = parameters.services;
        this._sorting = new Sorting(this._provider);
        this._registerHooks();
    }

    private _registerHooks(): void {
        const gridServices = this._services.get('gridServices');
        gridServices.get('columns').registerColumnDefinitionsHook(this._onColumnDefinitions, GRID_MODULE_PRIORITY.sorting);
        gridServices.get('columns').headers.registerColumnMenuSectionHook(this._onMenuSection, GRID_MODULE_PRIORITY.sorting);
        gridServices.get('columns').headers.registerColumnHeaderAdornmentsHook(this._onColumnHeaderAdornments, GRID_MODULE_PRIORITY.sorting);
    }

    public getSorting(): Sorting {
        return this._sorting;
    }

    public isColumnSortable(column: IColumn): boolean {
        return !!column.metadata?.IsValidForGrid && column.dataType !== DataTypes.MultiSelectOptionSet;
    }

    public isSorted(column: IColumn): boolean {
        return this._provider.getSorting().some(sorted => sorted.name === column.name);
    }

    public isSortedDescending(column: IColumn): boolean {
        return this._provider.getSorting().find(sorted => sorted.name === column.name)?.sortDirection === 1;
    }

    public sortColumn(columnName: string, descending?: boolean, appendToExisting?: boolean): void {
        this._withUnsavedChangesBlocker(() => {
            this._sorting.getColumnSorting(columnName).setSortValue(descending ? 1 : 0, appendToExisting ?? false);
            this._provider.refresh();
        });
    }

    public clearColumnSorting(columnName: string): void {
        this._withUnsavedChangesBlocker(() => {
            this._sorting.getColumnSorting(columnName).clear();
            this._provider.refresh();
        });
    }

    /** Puts `sortable` on the definitions. */
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        for (const colDef of columnDefs) {
            const columnName = colDef.colId ?? colDef.field;
            const column = columnName ? this._provider.getColumnsMap()[columnName] : undefined;
            if (column) {
                colDef.sortable = this.isColumnSortable(column);
            }
        }
    };

    /** What a column's menu offers: the two directions, and clearing them. */
    private _onMenuSection = (sections: IColumnMenuSection[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
        if (!column || !this.isColumnSortable(column)) {
            return;
        }
        const mine: IContextualMenuItem[] = [{
            key: 'sort_asc',
            checked: this.isSorted(column) && !this.isSortedDescending(column),
            text: this.getSortingLabel(column.name, false),
            iconProps: { iconName: 'SortUp' },
            onClick: (event) => this.sortColumn(column.name, false, event?.shiftKey),
        }, {
            key: 'sort_desc',
            checked: this.isSorted(column) && this.isSortedDescending(column),
            text: this.getSortingLabel(column.name, true),
            iconProps: { iconName: 'SortDown' },
            onClick: (event) => this.sortColumn(column.name, true, event?.shiftKey),
        }];
        if (this.isSorted(column)) {
            mine.push({
                key: 'clear',
                text: this._labels.getLocalizedString('clear'),
                iconProps: { iconName: 'ClearSelection' },
                onClick: () => this.clearColumnSorting(column.name),
            });
        }
        sections.push({ key: 'sorting', title: this._labels.getLocalizedString('menuSection'), items: mine });
    };

    /** The sort direction, as the header shows it. */
    private _onColumnHeaderAdornments = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader): void => {
        const column = header.getColumn();
        if (!column || !this.isSorted(column)) {
            return;
        }
        adornments.push({
            key: 'sort',
            placement: 'suffix',
            onRender: () => this.components.onRenderSortIcon({ descending: this.isSortedDescending(column) }),
        });
    };


    public getSortingLabel(columnName: string, descending?: boolean): string {
        const column = this._services.get('gridServices').get('provider').getColumnsMap()[columnName]!;
        switch (column.dataType) {
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.WholeDuration:
            case DataTypes.Currency: {
                if (!descending) {
                    return this._labels.getLocalizedString('sortNumberAscending')
                }
                return this._labels.getLocalizedString('sortNumberDescending')
            }
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                if (!descending) {
                    return this._labels.getLocalizedString('sortDateAscending')
                }
                return this._labels.getLocalizedString('sortDateDescending')
            }
            case DataTypes.TwoOptions: {
                const options = column.metadata?.OptionSet ?? [];
                if (!descending) {
                    return `${options[0].Label} ${this._labels.getLocalizedString('sortTwoOptionsJoint')} ${options[1].Label}`
                }
                return `${options[1].Label} ${this._labels.getLocalizedString('sortTwoOptionsJoint')} ${options[0].Label}`
            }
            default: {
                if (!descending) {
                    return this._labels.getLocalizedString('sortTextAscending')
                }
                return this._labels.getLocalizedString('sortTextDescending')
            }
        }

    }

    private _withUnsavedChangesBlocker(write: () => void): void {
        (this._provider as IInternalDataProvider).executeWithUnsavedChangesBlocker(write);
    }

    private get _provider() {
        return this._services.get('gridServices').get('provider');
    }

    public get components(): IGridSortingComponents {
        return this._services.get('components');
    }

    private get _labels(): ILocalizationService<IGridSortingLabels> {
        return this._services.get('labels');
    }
}
