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
    const preventDismissOnEvent = (e: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | React.FocusEvent<Element, Element>) => {
        if(e.type !== 'scroll') {
            return false;
        }
        const target = e.target  as HTMLElement;
        //check for vertical scroll
        if (target?.classList?.contains('ag-body-viewport') || target?.classList?.contains('ag-body-vertical-scroll-viewport')) {
            return true;
        }
        //ios outputs horizontal scroll if focused in callout btn which would result in dismiss of callout
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            return true;
        }
        return false;
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
                <SortingContextualMenu 
                    target={buttonRef}
                    calloutProps={{
                        preventDismissOnEvent: preventDismissOnEvent
                    }} 
                    {...columnHeaderContextualMenuProps} />
            }
            {filterCalloutProps &&
                <FilterCallout preventDismissOnEvent={preventDismissOnEvent} target={buttonRef} {...filterCalloutProps} />
            }
        </>
    )
};