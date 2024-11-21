import { DataType } from '../../../enums/DataType';
import { IGridColumn } from '../../../interfaces/IGridColumn';
import { Component } from '../../Component/Component';
import { ICellEditorParams } from '@ag-grid-community/core';
import { IRecord } from '@talxis/client-libraries';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { useRerender } from '../../../../../../hooks/useRerender';

interface ICell extends ICellEditorParams {
    baseColumn: IGridColumn;
    data: IRecord
}

export const EditableCell = (editableCellProps: ICell) => {
    const grid = useGridInstance();
    const column = editableCellProps.baseColumn;
    const record = editableCellProps.data;
    const rerender = useRerender();

    const onNotifyOutputChanged = (value: any) => {
        switch(column.dataType) {
            case DataType.OPTIONSET:
            case DataType.DATE_AND_TIME_DATE_ONLY:
            case DataType.WHOLE_DURATION: {
                editableCellProps.stopEditing();
                break;
            }
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_CUSTOMER: {
                if(value?.length > 0) {
                    editableCellProps.stopEditing();
                }
                break;
            }
        }
        if(grid.parameters.EnableMultiEdit?.raw && grid.dataset.getSelectedRecordIds().includes(record.getRecordId())) {
            const records = grid.records.filter(record => grid.dataset.getSelectedRecordIds().includes(record.getRecordId()))
            records.map(record => setValue(record, value))
        }
        else {
            setValue(record, value)
        }
        grid.pcfContext.factory.requestRender();
        rerender();
    }

    const setValue = (record: IRecord, value: any) => {
        record.setValue(column.name, value);
        editableCellProps.api.resetRowHeights();
    }

    return <Component
        column={column}
        record={record}
        onNotifyOutputChanged={onNotifyOutputChanged}
        onOverrideControlProps={(props) => {
            return {
                ...props,
                context: {
                    ...props.context,
                    mode: {
                        ...props.context.mode,
                        allocatedHeight: (() => {
                            return editableCellProps.node.rowHeight!
                        })()
                    },
                    fluentDesignLanguage: props.context.fluentDesignLanguage ? {
                        ...props.context.fluentDesignLanguage,
                        tokenTheme: {
                            ...props.context.fluentDesignLanguage.tokenTheme,
                            underlined: false,
                        }
                    } : undefined
                },
                parameters: {
                    ...props.parameters,
                    AutoFocus: {
                        raw: true
                    },
                    EnableNavigation: {
                        raw: false
                    },
                    IsInlineNewEnabled: {
                        raw: false
                    },
                    EnableTypeSuffix: {
                        raw: false
                    }
                }
            }
        }}
    />
}