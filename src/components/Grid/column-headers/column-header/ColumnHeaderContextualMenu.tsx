import React from 'react';
import { ContextualMenu, ContextualMenuItemType, IContextualMenuItem, IContextualMenuProps, useTheme } from '@fluentui/react';
import { Filter24Regular, ArrowSortUp24Regular, ArrowSortDown24Regular, FilterDismiss24Regular, Dismiss24Regular, Autosum24Regular, GroupList24Regular, AppsList24Regular } from '@fluentui/react-icons';
import { getColumnHeaderContextualMenuStyles } from './styles';
import { DataTypes } from '@talxis/client-libraries';
import { useGridInstance } from '../../grid/useGridInstance';
import { IGridColumn } from '../../grid/GridModel';

export interface IColumnHeaderContextualMenuProps extends Omit<IContextualMenuProps, 'items'> {
    column: IGridColumn;
    onDismiss: (e?: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>, dismissAll?: boolean, showFilterCallout?: boolean) => void;
}

export const ColumnHeaderContextualMenu = (props: IColumnHeaderContextualMenuProps) => {
    const grid = useGridInstance();
    const dataset = grid.getDataset();
    const labels = grid.getLabels();
    const styles = getColumnHeaderContextualMenuStyles(useTheme());
    const { onDismiss } = { ...props };
    const column = grid.getGridColumnByName(props.column.name, true);

    const aggregationFunctionList = column.metadata?.SupportedAggregations ?? [];

    const getItems = (): IContextualMenuItem[] => {
        const items: IContextualMenuItem[] = [
            {
                key: 'sort_asc',
                checked: column.isSorted && !column.isSortedDescending,
                disabled: column.disableSorting,
                text: grid.getColumnSortingLabel(column.name, false),
                className: styles.item,
                onRenderIcon: () => <ArrowSortUp24Regular />,
                onClick: () => grid.sortColumn(column.name, false)
            },
            {
                key: 'sort_desc',
                checked: column.isSorted && column.isSortedDescending,
                disabled: column.disableSorting,
                text: grid.getColumnSortingLabel(column.name, true),
                className: styles.item,
                onRenderIcon: () => <ArrowSortDown24Regular />,
                iconProps: {},
                onClick: () => grid.sortColumn(column.name, true)
            },
            {
                key: 'divider',
                itemType: ContextualMenuItemType.Divider
            },
            {
                key: 'filter',
                className: styles.item,
                disabled: !column.isFilterable,
                text: labels['filtermenu-filterby'](),
                onRenderIcon: () => <Filter24Regular />,
                onClick: (e) => onDismiss(e, false, true)
            },
            ...(column.canBeGrouped ? [
                {
                    key: 'divider-grouping',
                    itemType: ContextualMenuItemType.Divider
                }, {
                    key: 'group',
                    text: column.grouping?.isGrouped ? labels['filtersortmenu-ungroup']() : labels['filtersortmenu-group'](),
                    onRenderIcon: () => column.grouping?.isGrouped ? <AppsList24Regular /> : <GroupList24Regular />,
                    onClick: () => grid.toggleColumnGroup(column.name)
                }
            ] : []),
            ...(column.canBeAggregated && aggregationFunctionList.length > 0 ? [
                {
                    key: 'divider-aggregation',
                    itemType: ContextualMenuItemType.Divider
                },
                {
                    key: 'total',
                    text: labels['filtersortmenu-total'](),
                    onRenderIcon: () => <Autosum24Regular />,
                    subMenuProps: {
                        items: [
                            ...!column.grouping?.isGrouped ? [
                                {
                                    key: 'none',
                                    className: styles.item,
                                    checked: !column.aggregation,
                                    text: labels['filtersortmenu-total-none'](),
                                    onClick: () => grid.removeAggregation(column.aggregation?.alias!)

                                }
                            ] : [],
                            ...aggregationFunctionList.map(aggregationFunction => {
                                return {
                                    key: aggregationFunction,
                                    className: styles.item,
                                    checked: column.aggregation?.aggregationFunction === aggregationFunction,
                                    text: labels[`filtersortmenu-total-${aggregationFunction}`](),
                                    onClick: () => grid.addAggregation(column.name, aggregationFunction)
                                }
                            })]
                    }
                }
            ] : []),
            {
                key: 'divider-footer',
                itemType: ContextualMenuItemType.Divider
            },
            ...(dataset.sorting.find(x => x.name === column.name) ? [{
                key: 'clear',
                text: labels['filtersortmenu-clearsorting'](),
                onRenderIcon: () => <Dismiss24Regular />,
                onClick: () => grid.clearColumnSorting(column.name)
            }] : []),
            ...(column.isFiltered ? [{
                key: 'clearFilter',
                text: labels['filtersortmenu-clearfilter'](),
                onRenderIcon: () => <FilterDismiss24Regular />,
                onClick: () => grid.removeColumnFilter(column.name, true)
            }] : []),

        ];
        return items
    }
    return <ContextualMenu {...props} items={getItems()} />;
};