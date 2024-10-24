import * as React from 'react';
import { DataType } from '../../../enums/DataType';
import { IGridColumn } from '../../../interfaces/IGridColumn';
import { useRecordUpdateServiceController } from '../../../services/RecordUpdateService/controllers/useRecordUpdateServiceController';
import { Component } from '../../Component/Component';
import { ICellEditorParams } from '@ag-grid-community/core';
import { IRecord } from '@talxis/client-libraries';

interface ICell extends ICellEditorParams {
    baseColumn: IGridColumn;
    data: IRecord
}

export const EditableCell = (props: ICell) => {
    const column = props.baseColumn;
    const recordUpdateService = useRecordUpdateServiceController();
    const mountedRef = React.useRef(true);
    const hasBeenUpdatedRef = React.useRef<boolean>(false);
    const record = props.data;
    const valueRef = React.useRef(record.getValue(column.name));

    React.useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (!hasBeenUpdatedRef.current) {
                return;
            }
            recordUpdateService.record(record.getRecordId()).setValue(column.name, valueRef.current)
        }
    }, []);

    const onNotifyOutputChanged = (value: any) => {
        valueRef.current = value;
        hasBeenUpdatedRef.current = true;
        if(!mountedRef.current) {
            recordUpdateService.record(record.getRecordId()).setValue(column.name, valueRef.current)
            return;
        }
        switch(column.dataType) {
            case DataType.OPTIONSET:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                props.stopEditing();
                return;
            }
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_CUSTOMER: {
                if(value?.length > 0) {
                    props.stopEditing();
                    return;
                }
            }
        }
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