import React, { useEffect, useState } from 'react';
import { ContextualMenu, ContextualMenuItemType, IContextualMenuItem, IContextualMenuProps, useTheme } from '@fluentui/react';
import { IGridColumn } from '../../../core/interfaces/IGridColumn';
import { DataType } from '../../../core/enums/DataType';
import { getColumnHeaderContextualMenuStyles } from './styles';
import { useGridInstance } from '../../../core/hooks/useGridInstance';
import { useColumnSortingController } from '../../controllers/useColumnSortingController';
import { useColumnFilterConditionController } from '../../../filtering/controller/useColumnFilterConditionController';

export interface ISortingContextualMenu extends Omit<IContextualMenuProps, 'items'> {
    column: IGridColumn;
    onDismiss: (e?: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>, dismissAll?: boolean, showFilterCallout?: boolean) => void;
}

export const SortingContextualMenu = (props: ISortingContextualMenu) => {
    const grid = useGridInstance();
    const labels = grid.labels;
    const styles = getColumnHeaderContextualMenuStyles(useTheme());
    const {column, onDismiss} = {...props};
    const sorting = useColumnSortingController(column);
    const condition = useColumnFilterConditionController(column);
    const [items, setItems] = useState<IContextualMenuItem[]>([]);

    useEffect(() => {
        (async() => {
            setItems(await getItems())
        })();
    }, [condition]);

    const getTwoOptionsSortLabel = async (isDesc?: boolean) => {
        const options = column.metadata?.OptionSet ?? [];
        if(!isDesc) {
            return `${options[0].Label} ${labels['filtersortmenu-sorttwooption-joint']()} ${options[1].Label}`
        }
        return `${options[1].Label} ${labels['filtersortmenu-sorttwooption-joint']()} ${options[0].Label}`
    }
    const getLabel = async (isDesc?: boolean) => {
        switch (column.dataType) {
            case DataType.WHOLE_NONE:
            case DataType.DECIMAL:
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
        if(!condition) {
            return []
        }
        const items: IContextualMenuItem[] = [
            {
                key: 'sort_asc',
                checked: column.isSorted && !column.isSortedDescending,
                disabled: column.disableSorting || column.dataType === DataType.MULTI_SELECT_OPTIONSET,
                text: await getLabel(),
                className: styles.item,
                iconProps: {
                    iconName: 'SortUp'
                },
                onClick: () => sorting.sort(0)
            },
            {
                key: 'sort_desc',
                checked: column.isSorted && column.isSortedDescending,
                disabled: column.disableSorting || column.dataType === DataType.MULTI_SELECT_OPTIONSET,
                text: await getLabel(true),
                className: styles.item,
                iconProps: {
                    iconName: 'SortDown'
                },
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
                iconProps: {
                    iconName: 'Filter'
                },
                onClick: (e) => onDismiss(e, false, true)
            }
        ];
        if (condition.isAppliedToDataset) {
            items.push({
                key: 'clearFilter',
                text: labels['filtersortmenu-clearfilter'](),
                iconProps: {
                    iconName: 'ClearFilter'
                },
                onClick: () => {
                    condition.remove();
                    condition.save();
                }
            });
        }
        return items
    }
    return <ContextualMenu {...props} items={items} />;
};