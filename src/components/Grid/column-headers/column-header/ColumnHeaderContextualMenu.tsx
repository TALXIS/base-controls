import React from 'react';
import { ContextualMenu, ContextualMenuItemType, IContextualMenuItem, IContextualMenuProps, useTheme } from '@fluentui/react';
import { Filter24Regular, ArrowSortUp24Regular, ArrowSortDown24Regular, FilterDismiss24Regular, Dismiss24Regular, Autosum24Regular, GroupList24Regular, AppsList24Regular } from '@fluentui/react-icons';
import { getColumnHeaderContextualMenuStyles } from './styles';
import { DataTypes, Type as FilterType } from '@talxis/client-libraries';
import { useGridInstance } from '../../grid/useGridInstance';
import { IGridColumn } from '../../grid/GridModel';

export interface IColumnHeaderContextualMenuProps extends Omit<IContextualMenuProps, 'items'> {
    column: IGridColumn;
    onDismiss: (e?: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>, dismissAll?: boolean, showFilterCallout?: boolean) => void;
}

export const ColumnHeaderContextualMenu = (props: IColumnHeaderContextualMenuProps) => {
    const grid = useGridInstance();
    const dataset = grid.getDataset();
    const aggregation = grid.getAggregation();
    const grouping = grid.getGrouping();
    const labels = grid.getLabels();
    const styles = getColumnHeaderContextualMenuStyles(useTheme());
    const { column, onDismiss } = { ...props };
    const filtering = grid.getFiltering();
    const columnSorting = grid.getSorting().getColumnSorting(column.name);
    const columnFilter = filtering.getColumnFilter(column.name);
    const isGroupingAppliedToColumn = grouping.isGroupingAppliedToColumn(column.name);


    const getTwoOptionsSortLabel = (isDesc?: boolean) => {
        const options = column.metadata?.OptionSet ?? [];
        if (!isDesc) {
            return `${options[0].Label} ${labels['filtersortmenu-sorttwooption-joint']()} ${options[1].Label}`
        }
        return `${options[1].Label} ${labels['filtersortmenu-sorttwooption-joint']()} ${options[0].Label}`
    }

    const getLabel = (isDesc?: boolean): string => {
        switch (column.dataType) {
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.WholeDuration:
            case DataTypes.Currency: {
                if (!isDesc) {
                    return labels['filtersortmenu-sortnumber-a-z']()
                }
                return labels['filtersortmenu-sortnumber-z-a']()
            }
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                if (!isDesc) {
                    return labels['filtersortmenu-sortdate-a-z']()
                }
                return labels['filtersortmenu-sortdate-z-a']()
            }
            case DataTypes.TwoOptions: {
                return getTwoOptionsSortLabel(isDesc);
            }
            default: {
                if (!isDesc) {
                    return labels['filtersortmenu-sorttext-a-z']()
                }
                return labels['filtersortmenu-sorttext-z-a']()
            }
        }
    }

    const onClearFilter = () => {
        filtering.removeColumnFilter(column.name);
        const filterExpression = filtering.getFilterExpression(FilterType.And.Value);
        if (!filterExpression) {
            throw new Error('Filter expression is invalid');
        }
        dataset.filtering.setFilter(filterExpression);
        dataset.refresh();
    }

    const onGroup = () => {
        if(isGroupingAppliedToColumn) {
            grouping.ungroupColumn(column.name);
        }
        else {
            grouping.groupColumn(column.name);
        }
        dataset.refresh();
    }

    const getItems = (): IContextualMenuItem[] => {
        const items: IContextualMenuItem[] = [
            {
                key: 'sort_asc',
                checked: column.isSorted && !column.isSortedDescending,
                disabled: column.disableSorting || column.dataType === DataTypes.MultiSelectOptionSet,
                text: getLabel(),
                className: styles.item,
                onRenderIcon: () => <ArrowSortUp24Regular />,
                onClick: () => {
                    columnSorting.setSortValue(0)
                    dataset.refresh()
                }
            },
            {
                key: 'sort_desc',
                checked: column.isSorted && column.isSortedDescending,
                disabled: column.disableSorting || column.dataType === DataTypes.MultiSelectOptionSet,
                text: getLabel(true),
                className: styles.item,
                onRenderIcon: () => <ArrowSortDown24Regular />,
                iconProps: {},
                onClick: () => {
                    columnSorting.setSortValue(1)
                    dataset.refresh()
                }
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
                },{
                    key: 'group',
                    text: isGroupingAppliedToColumn ? labels['filtersortmenu-ungroup']() : labels['filtersortmenu-group'](),
                    onRenderIcon: () => isGroupingAppliedToColumn ? <AppsList24Regular /> : <GroupList24Regular />,
                    onClick: () => onGroup()
                }
            ] : []),
            ...(column.canBeAggregated ? [
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
                            {
                                key: 'none',
                                className: styles.item,
                                //checked: aggregation.isAggregationAppliedToColumn(column.name, 'none'),
                                text: labels['filtersortmenu-total-none'](),
                                onClick: () => {
                                    dataset.aggregation.removeAggregation(column.name)
                                }

                            },
                            ...column.metadata!.SupportedAggregations!.map(aggregationFunction => {
                                return {
                                    key: aggregationFunction,
                                    className: styles.item,
                                    //checked: aggregation.isAggregationAppliedToColumn(column.name, aggregationFunction),
                                    text: labels[`filtersortmenu-total-${aggregationFunction}`](),
                                    onClick: () => {
                                        dataset.aggregation.addAggregation({
                                            columnName: column.name,
                                            alias: `${column.name}_${aggregationFunction}`,
                                            aggregationFunction: aggregationFunction
                                        })
                                        dataset.refresh();
                                    }
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
                onClick: () => {
                    columnSorting.clear();
                    dataset.refresh()
                }
            }] : []),
            ...(columnFilter.isAppliedToDataset() ? [{
                key: 'clearFilter',
                text: labels['filtersortmenu-clearfilter'](),
                onRenderIcon: () => <FilterDismiss24Regular />,
                onClick: () => onClearFilter()
            }] : []),

        ];
        return items
    }
    return <ContextualMenu {...props} items={getItems()} />;
};