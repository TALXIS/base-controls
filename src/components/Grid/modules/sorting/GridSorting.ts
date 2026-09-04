import { ColDef } from "@ag-grid-community/core";
import { Icon, IContextualMenuItem } from "@fluentui/react";
import { DataTypes, IColumn, IInternalDataProvider, IRecord, Sorting } from "@talxis/client-libraries";
import { ILocalizationService } from "@utils";
import { IGridSortingLabels } from "./labels";
import { IGridSortingComponents } from "./moduleComponents";
import { IGridColumnHeaderAdornment, IGridColumnMenuSection } from "../../grid/column-header";
import { IGridColumn } from "../../grid/columns";
import { IGridSortingServiceLocator } from "./services";

export interface IGridSortingParameters {
    /** This module's own locator, which is what everything inside it reaches through. */
    services: IGridSortingServiceLocator;
}

/**
 * Sorting the grid by a column.
 *
 * The dataset holds the sorting; this drives it and says what a column's menu offers. A grid without this
 * module cannot be sorted from its header, and its definitions carry no sort at all.
 */
export class GridSorting {
    private _services: IGridSortingServiceLocator;
    private _sorting: Sorting;

    constructor(parameters: IGridSortingParameters) {
        this._services = parameters.services;
        this._sorting = new Sorting(this._provider);
    }

    public getSorting(): Sorting {
        return this._sorting;
    }

    public isColumnSortable(column: IColumn): boolean {
        return !!column.metadata?.IsValidForGrid && column.dataType !== DataTypes.MultiSelectOptionSet;
    }

    public isSorted(column: IGridColumn): boolean {
        return this._provider.getSorting().some(sorted => sorted.name === column.name);
    }

    public isSortedDescending(column: IGridColumn): boolean {
        return this._provider.getSorting().find(sorted => sorted.name === column.name)?.sortDirection === 1;
    }

    /** @param appendToExisting Adds to the sorting already applied rather than replacing it. */
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

    /** Puts `sortable` on the definitions, which the grid itself no longer knows to set. */
    public applyColumnDefinitions(columnDefs: ColDef<IRecord>[]): void {
        for (const colDef of columnDefs) {
            const columnName = colDef.colId ?? colDef.field;
            const column = columnName ? this._provider.getColumnsMap()[columnName] : undefined;
            if (column) {
                colDef.sortable = this.isColumnSortable(column);
            }
        }
    }

    /** What a column's menu offers: the two directions, and clearing them. */
    public applyMenuSection(sections: IGridColumnMenuSection[], column: IGridColumn): void {
        if (!this.isColumnSortable(column)) {
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
    }

    /** The sort direction, as the header shows it. */
    public applyColumnHeaderAdornments(adornments: IGridColumnHeaderAdornment[], column: IGridColumn): void {
        if (!this.isSorted(column)) {
            return;
        }
        adornments.push({
            key: 'sort',
            placement: 'suffix',
            onRender: () => this.components.onRenderSortIcon({ descending: this.isSortedDescending(column) }),
        });
    }


    /** What sorting a column reads as, which depends on what it holds. */
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

    /** The parts this module renders, merged with whatever the caller replaced. */
    public get components(): IGridSortingComponents {
        return this._services.get('components');
    }

    private get _labels(): ILocalizationService<IGridSortingLabels> {
        return this._services.get('labels');
    }
}
