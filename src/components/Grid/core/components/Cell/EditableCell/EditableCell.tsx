import * as React from 'react';
import { NumeralPCF } from '../../../../../../utils/NumeralPCF';
import { DataType } from '../../../enums/DataType';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { IGridColumn } from '../../../interfaces/IGridColumn';
import { useRecordUpdateServiceController } from '../../../services/RecordUpdateService/controllers/useRecordUpdateServiceController';
import { Component } from '../../Component/Component';
import { ICellEditorParams } from '@ag-grid-community/core';
import numeral from "numeral";
import { IEntityRecord } from '../../../../interfaces';

interface ICell extends ICellEditorParams {
    baseColumn: IGridColumn;
    data: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
}

export const EditableCell = (props: ICell) => {
    const grid = useGridInstance();
    const column = props.baseColumn;
    const recordUpdateService = useRecordUpdateServiceController();
    const mountedRef = React.useRef(true);
    const hasBeenUpdatedRef = React.useRef<boolean>(false);
    const record: IEntityRecord = (() => {
        //this is so we can load the updated record values from state
        const updatedRecord = grid.recordUpdateService.record(props.data.getRecordId()).get() as any;
        return updatedRecord ?? props.data;
    })();
    const valueRef = React.useRef(record.getValue(column.key));
    const [value, setValue] = React.useState(valueRef.current);

    React.useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (!hasBeenUpdatedRef.current) {
                return;
            }
            recordUpdateService.record(record.getRecordId()).setValue(column.key, getRecordValue(valueRef.current))
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
    //this is just so the setValue API in Power Apps accepts the values that come from the components
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
            recordUpdateService.record(record.getRecordId()).setValue(column.key, getRecordValue(valueRef.current))
            return;
        }
        switch(column.dataType) {
            case DataType.OPTIONSET:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                props.stopEditing();
                return;
            }
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE: {
                if(value?.length > 0) {
                    props.stopEditing();
                    return;
                }
            }
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
                raw: 41
            },
            EnableNavigation: {
                raw: false
            }
        }}
    />
}