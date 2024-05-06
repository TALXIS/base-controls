import { ColDef, GridApi, IRowNode } from "ag-grid-community"
import { useEffect, useState } from "react";
import { EditableCell } from "../components/Cell/EditableCell/EditableCell";
import { ReadOnlyCell } from "../components/Cell/ReadOnlyCell/ReadOnlyCell";
import { ColumnHeader } from "../components/ColumnHeader/ColumnHeader";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GlobalCheckBox } from "../components/ColumnHeader/GlobalCheckbox/GlobalCheckbox";
import { useGridDependencies } from "./useGridDependencies";
import React from 'react';
import { IGridColumn } from "../interfaces/IGridColumn";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export const useAgGrid = (columns: IGridColumn[]): {
    agColumns: ColDef[],
    selectRows: (gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>) => void;
} => {
    const [agColumns, setAgColumns] = useState<ColDef[]>([]);
    const [pcfContext, dataset] = useGridDependencies();

    const getAgColumn = (column: IGridColumn): ColDef => {
        const agColumn = {
            field: column.key,
            headerName: column.displayName,
            width: column.width,
            sortable: column.isSortable,
            editable: column.isEditable,
            resizable: column.isResizable,
            autoHeaderHeight: true,
            valueFormatter: (p) => {
                return p.data.getFormattedValue(column.key)
            },
            valueGetter: (p) => {
                return p.data.getValue(column.key)
            },
            cellRendererParams: {
                baseColumn: column
            },
            cellEditorParams: {
                baseColumn: column
            },
            cellRenderer: ReadOnlyCell,
            cellEditor: EditableCell,
            headerComponent: ColumnHeader,
            headerComponentParams: {
                baseColumn: column
            },
            //disable stop of editing on pressing Enter
            //TODO: only for specific column types?
            suppressKeyboardEvent: (params) => {
                if(params.event.key === 'Enter') {
                    return true;
                }
                return false;
            }
        } as ColDef;

        if(agColumn.field === '__checkbox') {
            agColumn.lockPosition = 'left';
            agColumn.headerComponent = GlobalCheckBox
        }
        return agColumn;
    }

    const selectRows = (gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>>) => {
        if(!gridApiRef.current) {
            return;
        }
        const nodesToSelect: IRowNode[] = [];
        gridApiRef.current.deselectAll();
        gridApiRef.current.forEachNode((node) => {
            if (dataset.getSelectedRecordIds().includes(node.data.getRecordId())) {
                nodesToSelect.push(node);
            }
        });
        gridApiRef.current.setNodesSelected({
            nodes: nodesToSelect,
            newValue: true
        });
        //TODO: target the cells directly
        pcfContext.factory.requestRender();
    }
    useEffect(() => {
        if(columns.length === 0) {
            return;
        }
        setAgColumns(columns.map(column => {
            return getAgColumn(column);
        }))
    }, [columns]);

    return {agColumns, selectRows}
}