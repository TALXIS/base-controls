import React from 'react';
import { ContextualMenu, ContextualMenuItemType, IContextualMenuItem, IContextualMenuProps, useTheme } from '@fluentui/react';
import { IGridColumn } from '../../../interfaces/IGridColumn';
import { DataType } from '../../../enums/DataType';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { Filter24Regular, ArrowSortUp24Regular, ArrowSortDown24Regular, FilterDismiss24Regular, Dismiss24Regular, Autosum24Regular } from '@fluentui/react-icons';
import { Grid2 } from '../../../model/Grid';
import { getColumnHeaderContextualMenuStyles } from './styles';
import { Type as FilterType } from '@talxis/client-libraries';

export interface IColumnHeaderContextualMenuProps extends Omit<IContextualMenuProps, 'items'> {
    column: IGridColumn;
    onDismiss: (e?: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>, dismissAll?: boolean, showFilterCallout?: boolean) => void;
}

export const ColumnHeaderContextualMenu = (props: IColumnHeaderContextualMenuProps) => {
    const grid: Grid2 = useGridInstance() as any;
    const dataset = grid.getDataset();
    const aggregation = grid.getAggregation();
    const labels = grid.getLabels();
    const styles = getColumnHeaderContextualMenuStyles(useTheme());
    const { column, onDismiss } = { ...props };
    const filtering = grid.getFiltering();
    const columnSorting = grid.getSorting().getColumnSorting(column.name);
    const columnFilter = filtering.getColumnFilter(column.name);


    const getTwoOptionsSortLabel = (isDesc?: boolean) => {
        const options = column.metadata?.OptionSet ?? [];
        if (!isDesc) {
            return `${options[0].Label} ${labels['filtersortmenu-sorttwooption-joint']()} ${options[1].Label}`
        }
        return `${options[1].Label} ${labels['filtersortmenu-sorttwooption-joint']()} ${options[0].Label}`
    }

    const getLabel = (isDesc?: boolean): string => {
        switch (column.dataType) {
            case DataType.WHOLE_NONE:
            case DataType.DECIMAL:
            case DataType.WHOLE_DURATION:
            case DataType.CURRENCY: {
                if (!isDesc) {
                    return labels['filtersortmenu-sortnumber-a-z']()
                }
                return labels['filtersortmenu-sortnumber-z-a']()
            }
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                if (!isDesc) {
                    return labels['filtersortmenu-sortdate-a-z']()
                }
                return labels['filtersortmenu-sortdate-z-a']()
            }
            case DataType.TWO_OPTIONS: {
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

    const getItems = (): IContextualMenuItem[] => {
        const items: IContextualMenuItem[] = [
            {
                key: 'sort_asc',
                checked: column.isSorted && !column.isSortedDescending,
                disabled: column.disableSorting || column.dataType === DataType.MULTI_SELECT_OPTIONSET,
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
                disabled: column.disableSorting || column.dataType === DataType.MULTI_SELECT_OPTIONSET,
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
                                checked: aggregation.isAggregationAppliedToColumn(column.name, 'none'),
                                text: labels['filtersortmenu-total-none'](),
                                onClick: () => aggregation.removeAggregation(column.name)

                            },
                            ...column.metadata!.SupportedAggregations!.map(aggregationFunction => {
                                return {
                                    key: aggregationFunction,
                                    className: styles.item,
                                    checked: aggregation.isAggregationAppliedToColumn(column.name, aggregationFunction),
                                    text: labels[`filtersortmenu-total-${aggregationFunction}`](),
                                    onClick: () => aggregation.addAggregation(column.name, aggregationFunction)
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