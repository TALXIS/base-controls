import React, { useEffect, useState } from 'react';
import { ContextualMenu, ContextualMenuItemType, IContextualMenuItem, IContextualMenuProps, useTheme } from '@fluentui/react';
import { IGridColumn } from '../../../core/interfaces/IGridColumn';
import { DataType } from '../../../core/enums/DataType';
import { getColumnHeaderContextualMenuStyles } from './styles';
import { useGridInstance } from '../../../core/hooks/useGridInstance';
import { useColumnSortingController } from '../../controllers/useColumnSortingController';
import { useColumnFilterConditionController } from '../../../filtering/controller/useColumnFilterConditionController';
import { AggregationFunction } from '@talxis/client-libraries';
import { TableBottomRow24Filled, Filter24Regular, ArrowSortUp24Regular, ArrowSortDown24Regular, FilterDismiss24Regular, Dismiss24Filled } from '@fluentui/react-icons';

export interface ISortingContextualMenu extends Omit<IContextualMenuProps, 'items'> {
    column: IGridColumn;
    onDismiss: (e?: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>, dismissAll?: boolean, showFilterCallout?: boolean) => void;
}

export const SortingContextualMenu = (props: ISortingContextualMenu) => {
    const grid = useGridInstance();
    const aggregation = grid.aggregation;
    const labels = grid.labels;
    const styles = getColumnHeaderContextualMenuStyles(useTheme());
    const { column, onDismiss } = { ...props };
    const sorting = useColumnSortingController(column);
    const condition = useColumnFilterConditionController(column);
    const [items, setItems] = useState<IContextualMenuItem[]>([]);

    useEffect(() => {
        (async () => {
            setItems(await getItems())
        })();
    }, [condition]);

    const getTwoOptionsSortLabel = async (isDesc?: boolean) => {
        const options = column.metadata?.OptionSet ?? [];
        if (!isDesc) {
            return `${options[0].Label} ${labels['filtersortmenu-sorttwooption-joint']()} ${options[1].Label}`
        }
        return `${options[1].Label} ${labels['filtersortmenu-sorttwooption-joint']()} ${options[0].Label}`
    }

    const onSetAggregation = (aggregationFunction: AggregationFunction) => {
        aggregation.addAggregation(column.name, aggregationFunction);
    }
    const onRemoveAggregation = () => {
        aggregation.removeAggregation(column.name);
    }

    const getLabel = async (isDesc?: boolean) => {
        switch (column.dataType) {
            case DataType.WHOLE_NONE:
            case DataType.DECIMAL:
            case DataType.WHOLE_DURATION:
            case DataType.FP:
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

    const getItems = async (): Promise<IContextualMenuItem[]> => {
        if (!condition) {
            return []
        }
        const items: IContextualMenuItem[] = [
            {
                key: 'sort_asc',
                checked: column.isSorted && !column.isSortedDescending,
                disabled: column.disableSorting || column.dataType === DataType.MULTI_SELECT_OPTIONSET,
                text: await getLabel(),
                className: styles.item,
                onRenderIcon: () => <ArrowSortUp24Regular />,
                onClick: () => sorting.sort(0)
            },
            {
                key: 'sort_desc',
                checked: column.isSorted && column.isSortedDescending,
                disabled: column.disableSorting || column.dataType === DataType.MULTI_SELECT_OPTIONSET,
                text: await getLabel(true),
                className: styles.item,
                onRenderIcon: () => <ArrowSortDown24Regular />,
                iconProps: {},
                onClick: () => sorting.sort(1)
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
                    onRenderIcon: () => <TableBottomRow24Filled />,
                    subMenuProps: {
                        items: [
                            {
                                key: 'none',
                                className: styles.item,
                                //@ts-ignore
                                checked: aggregation.isAggregationAppliedToColumn(column.name, 'none'),
                                text: labels['filtersortmenu-total-none'](),
                                onClick: () => onRemoveAggregation()
                            },
                            {
                                key: 'avg',
                                checked: aggregation.isAggregationAppliedToColumn(column.name, 'avg'),
                                className: styles.item,
                                text: labels['filtersortmenu-total-avg'](),
                                onClick: () => onSetAggregation('avg')
                            }, {
                                key: 'max',
                                checked: aggregation.isAggregationAppliedToColumn(column.name, 'max'),
                                className: styles.item,
                                text: labels['filtersortmenu-total-max'](),
                                onClick: () => onSetAggregation('max')
                            }, {
                                key: 'min',
                                checked: aggregation.isAggregationAppliedToColumn(column.name, 'min'),
                                className: styles.item,
                                text: labels['filtersortmenu-total-min'](),
                                onClick: () => onSetAggregation('min')
                            }, {
                                key: 'sum',
                                checked: aggregation.isAggregationAppliedToColumn(column.name, 'sum'),
                                className: styles.item,
                                text: labels['filtersortmenu-total-sum'](),
                                onClick: () => onSetAggregation('sum')
                            }
                        ]
                    }
                }
            ] : []),
            {
                key: 'divider-footer',
                itemType: ContextualMenuItemType.Divider
            },
            ...(grid.dataset.sorting.find(x => x.name === column.name) ? [{
                key: 'clear',
                text: labels['filtersortmenu-clearsorting'](),
                onRenderIcon: () => <Dismiss24Filled />,
                onClick: () => {
                    sorting.clear();
                }
            }] : []),
            ...(condition.isAppliedToDataset ? [{
                key: 'clearFilter',
                text: labels['filtersortmenu-clearfilter'](),
                onRenderIcon: () => <FilterDismiss24Regular />,
                onClick: () => {
                    condition.remove();
                    condition.save();
                }
            }] : []),

        ];
        return items
    }
    return <ContextualMenu {...props} items={items} />;
};