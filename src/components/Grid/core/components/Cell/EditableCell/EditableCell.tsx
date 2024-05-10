import * as React from 'react';
import { DataType } from '../../../enums/DataType';
import { IGridColumn } from '../../../interfaces/IGridColumn';
import { useRecordUpdateServiceController } from '../../../services/RecordUpdateService/controllers/useRecordUpdateServiceController';
import { Component } from '../../Component/Component';

interface ICell {
    baseColumn: IGridColumn;
    data: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
}

export const EditableCell = (props: ICell) => {
    const record = props.data;
    const column = props.baseColumn;
    const recordUpdateService = useRecordUpdateServiceController(record.getRecordId());
    const mountedRef = React.useRef(true);
    const valueRef = React.useRef(props.data.getValue(column.key));
    const [value, setValue] = React.useState(valueRef.current);
    const hasBeenUpdatedRef = React.useRef<boolean>(false);

    React.useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (!hasBeenUpdatedRef.current) {
                return;
            }
            recordUpdateService.currentRecord.setValue(column, getRecordValue(valueRef.current))
        }
    }, []);

    const getComponentValue = (value: any) => {
        //already is component value;
        if(hasBeenUpdatedRef.current) {
            return value;
        }
        switch(column.dataType) {
            case DataType.TWO_OPTIONS: {
                value = value === '1' ? true : false
                break;
            }
            case DataType.OPTIONSET: {
                value = value ? parseInt(value) : null;
                break;

            }
            case DataType.MULTI_SELECT_OPTIONSET: {
                value = value ? value.split(',').map((value: string) => parseInt(value)) : null;
                break;
            }
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_OWNER: {
                if(value && !Array.isArray(value)) {
                    value = [value];
                }
                value = value?.map((x: any) => {
                    return {
                        entityType: x.etn,
                        id: x.id.guid,
                        name: x.name
                    }
                })
                break;
            }
        }
        return value;
    }
    const getRecordValue = (value: any) => {
        switch (column.dataType) {
            case DataType.TWO_OPTIONS: {
                value = value === true ? '1' : '0';
                break;
            }
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_OWNER: {
                value = value?.map((x: any) => {
                    return {
                        entityName: x.entityType,
                        name: x.name,
                        id: x.id
                    }
                })?.[0];
                break;
            }
        }
        return value;
    }

    const onNotifyOutputChanged = (value: any) => {
        valueRef.current = value;
        hasBeenUpdatedRef.current = true;
        if(!mountedRef.current) {
            recordUpdateService.currentRecord.setValue(column, getRecordValue(valueRef.current))
            return;
        }
        setValue(valueRef.current);
    }

    return <Component
        column={column}
        value={getComponentValue(value)}
        formattedValue={record.getFormattedValue(column.key)}
        onNotifyOutputChanged={onNotifyOutputChanged}
        additionalParameters={{
            AutoFocus: {
                raw: true
            },
            Height: {
                raw: 42
            }
        }}
    />
}