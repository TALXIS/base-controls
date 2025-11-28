import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CommandBarButton, Icon, Label, useTheme } from '@fluentui/react';
import React from 'react';
import { useGridInstance } from '../../grid/useGridInstance';
import { IGridColumn } from '../../grid/GridModel';
import { ColumnHeaderContextualMenu, IColumnHeaderContextualMenuProps } from './ColumnHeaderContextualMenu';
import { FilterCallout } from './FilterCallout';
import { NestedControlRenderer } from '../../../NestedControlRenderer';
import { useRerender } from '@talxis/react-components';
import { useAgGridInstance } from '../../grid/ag-grid/useAgGridInstance';
import { useEventEmitter } from '../../../../hooks/useEventEmitter';
import { IAgGridModelEvents } from '../../grid/ag-grid/AgGridModel';

export interface IColumnHeader {
    baseColumn: IGridColumn;
}

export const ColumnHeader = (props: IColumnHeader) => {
    const grid = useGridInstance();
    const agGrid = useAgGridInstance();
    const column = grid.getGridColumnByName(props.baseColumn.name);
    const [columnHeaderContextualMenuProps, setColumnHeaderContextualMenuProps] = useState<IColumnHeaderContextualMenuProps | null>(null);
    const [filterCalloutProps, setFilterCalloutProps] = useState<any | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const rerender = useRerender();
    useEventEmitter<IAgGridModelEvents>(agGrid, 'onRefresh', rerender);

    //needs to be called with onTouchEnd as well since ag grid cancels the click event on them
    const onClick = () => {
        if ((!column.isFilterable && column.disableSorting && !column.canBeAggregated && !column?.metadata?.CanBeGrouped)) {
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
        if (e.type !== 'scroll') {
            return false;
        }
        const target = e.target as HTMLElement;
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
            <div ref={buttonRef} onClick={onClick} onTouchEnd={onClick}>
                <NestedControlRenderer
                    context={grid.getPcfContext()}
                    parameters={{
                        ControlName: 'GridColumnHeader',
                        Bindings: {
                            Column: {
                                isStatic: true,
                                value: column,
                                type: 'Object',
                            },
                            Dataset: {
                                value: grid.getDataset(),
                                isStatic: true,
                                type: 'Object',
                            },
                            EnableEditing: {
                                isStatic: true,
                                value: grid.isEditingEnabled(),
                                type: 'TwoOptions'
                            },
                            Filtering: {
                                isStatic: true,
                                value: grid.getFiltering(),
                                type: 'Object'
                            }
                        }
                    }}
                />
            </div>
            {columnHeaderContextualMenuProps &&
                <ColumnHeaderContextualMenu
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