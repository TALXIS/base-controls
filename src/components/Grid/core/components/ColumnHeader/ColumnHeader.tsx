import React, { useContext, useRef, useState } from 'react';
import { CommandBarButton, Icon, Label } from '@fluentui/react';
import { columnHeaderStyles } from './styles';
import { FilterCallout, IFilterCallout } from '../../../filtering/components/FilterCallout/FilterCallout';
import { IGridColumn } from '../../interfaces/IGridColumn';
import { ISortingContextualMenu, SortingContextualMenu } from '../../../sorting/components/SortingContextualMenu/SortingContextualMenu';
import { useColumnFilterConditionController } from '../../../filtering/controller/useColumnFilterConditionController';

export interface IColumnHeader {
    baseColumn: IGridColumn;
}

export const ColumnHeader = (props: IColumnHeader) => {
    const column = props.baseColumn;
    const [columnHeaderContextualMenuProps, setColumnHeaderContextualMenuProps] = useState<ISortingContextualMenu | null>(null);
    const [filterCalloutProps, setFilterCalloutProps] = useState<IFilterCallout | null>(null);
    const buttonRef = useRef<HTMLElement>(null);

    const onClick = () => {
        if ((column.isFilterable === false && column.isFilterable === false)) {
            return;
        }
        setColumnHeaderContextualMenuProps({
            column: column,
            onDismiss: (e, dismissAll, showFilterCallout) => {
                setColumnHeaderContextualMenuProps(null);
                if(!showFilterCallout) {
                    return;
                }
                setFilterCalloutProps({
                    column: column,
                    onDismiss: () => {
                        setFilterCalloutProps(null)
                    }
                })
            }
        });
    }
    return (
        <>
            <CommandBarButton
                elementRef={buttonRef}
                title={column.displayName}
                className={columnHeaderStyles.root}
                onClick={onClick}
            >
                {column.isEditable && <Icon className={columnHeaderStyles.editIcon} iconName='Edit' />}
                <Label className={columnHeaderStyles.label}>{column.displayName}</Label>
                <div className={columnHeaderStyles.filterSortIcons}>
                    {column.isSorted && <Icon iconName={column.isSortedDescending ? 'SortDown' : 'SortUp'} />}
                    {column.isFiltered && <Icon iconName='Filter' />}
                </div>
            </CommandBarButton>
            {columnHeaderContextualMenuProps &&
                <SortingContextualMenu target={buttonRef} {...columnHeaderContextualMenuProps} />
            }
            {filterCalloutProps &&
                <FilterCallout target={buttonRef} {...filterCalloutProps} />
            }
        </>
    )
};