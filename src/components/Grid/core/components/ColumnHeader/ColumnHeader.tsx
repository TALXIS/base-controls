import { useRef, useState } from 'react';
import { CommandBarButton, Icon, Label, useTheme } from '@fluentui/react';
import { FilterCallout, IFilterCallout } from '../../../filtering/components/FilterCallout/FilterCallout';
import { IGridColumn } from '../../interfaces/IGridColumn';
import { ISortingContextualMenu, SortingContextualMenu } from '../../../sorting/components/SortingContextualMenu/SortingContextualMenu';
import { getColumnHeaderStyles } from './styles';
import { useGridInstance } from '../../hooks/useGridInstance';
import React from 'react';

export interface IColumnHeader {
    baseColumn: IGridColumn;
}

export const ColumnHeader = (props: IColumnHeader) => {
    const grid = useGridInstance();
    const column = props.baseColumn;
    const [columnHeaderContextualMenuProps, setColumnHeaderContextualMenuProps] = useState<ISortingContextualMenu | null>(null);
    const [filterCalloutProps, setFilterCalloutProps] = useState<IFilterCallout | null>(null);
    const columnHeaderStyles = getColumnHeaderStyles(useTheme());
    const buttonRef = useRef<HTMLElement>(null);

    const onClick = () => {
        if ((column.isFilterable === false && column.isSortable === false)) {
            return;
        }
        setColumnHeaderContextualMenuProps({
            column: column,
            onDismiss: (e, dismissAll, showFilterCallout) => {
                setColumnHeaderContextualMenuProps(null);
                if (!showFilterCallout) {
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
                {grid.isEditable && !column.isEditable && <Icon className={columnHeaderStyles.editIcon} iconName='Uneditable' />}
                <div className={columnHeaderStyles.labelWrapper}>
                    <Label className={columnHeaderStyles.label}>{column.displayName}</Label>
                    {column.isRequired &&
                        <span className={columnHeaderStyles.requiredSymbol}>*</span>
                    }
                </div>
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