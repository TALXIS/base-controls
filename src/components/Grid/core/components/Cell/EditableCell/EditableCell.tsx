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

export const EditableCell = (props: ICell) => {
    const grid = useGridInstance();
    const column = props.baseColumn;
    const record = props.data;
    const rerender = useRerender();

    const onNotifyOutputChanged = (value: any) => {
        switch(column.dataType) {
            case DataType.OPTIONSET:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                props.stopEditing();
                break;
            }
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_CUSTOMER: {
                if(value?.length > 0) {
                    props.stopEditing();
                }
                break;
            }
        }
        grid.changeTracker.setValue(column.name, value, record)
        rerender();
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
                        allocatedHeight: 41
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
                    }
                }
            }
        }}
    />
}