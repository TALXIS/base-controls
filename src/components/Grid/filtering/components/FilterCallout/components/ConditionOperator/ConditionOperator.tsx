import { ComboBox } from '@talxis/react-components/dist/components/ComboBox';
import { DataType } from '../../../../../core/enums/DataType';
import { IComboBoxOption } from '@fluentui/react/lib/components/ComboBox/ComboBox.types';
import { FilteringUtils } from '../../../../utils/FilteringUtilts';
import { useGridInstance } from '../../../../../core/hooks/useGridInstance';
import { useColumnFilterConditionController } from '../../../../controller/useColumnFilterConditionController';
import { IGridColumn } from '../../../../../core/interfaces/IGridColumn';
import { DatasetConditionOperator } from '../../../../../core/enums/ConditionOperator';
import React from 'react';

interface IConditionOperator {
    column: IGridColumn;
}
export const ConditionOperator = (props: IConditionOperator) => {
    const { column } = { ...props };
    const operatorUtils = FilteringUtils.condition().operator();
    const grid = useGridInstance();
    const condition = useColumnFilterConditionController(column);

    //TODO: add missing text operator (begins with, ends with)
    const getOptions = (): IComboBoxOption[] => {
        let operators = operatorUtils.textFieldOperators;
        switch (column.dataType) {
            case DataType.WHOLE_NONE:
            case DataType.DECIMAL:
            case DataType.FP:
            case DataType.CURRENCY:
                operators = operatorUtils.numberOperators;
                break;
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY:
                operators = operatorUtils.dateOperators;
                break;
            case DataType.MULTI_SELECT_OPTIONSET:
                operators = operatorUtils.multipleOptionSetOperators;
                break;
            case DataType.FILE:
            case DataType.IMAGE: {
                operators = operatorUtils.fileOperators;
            }
        }
        return operators.map(operator => {
            return {
                key: operator.type,
                text: grid.labels[operator.key]()
            };
        });
    };
    if(!condition) {
        return <></>
    }
    return <ComboBox
        {...props}
        selectedKey={condition.operator.get()}
        shouldRestoreFocus={false}
        options={getOptions()}
        useComboBoxAsMenuWidth
        styles={{
            callout: {
                maxHeight: '300px !important'
            }
        }}
        onChange={(e, option) => {
            condition.operator.set(option!.key as DatasetConditionOperator)
        }} />;
}