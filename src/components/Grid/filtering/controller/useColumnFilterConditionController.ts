import { useEffect, useMemo, useState } from "react";
import { DatasetConditionOperator } from "../../core/enums/ConditionOperator";
import { useGridInstance } from "../../core/hooks/useGridInstance"
import { useRerender } from "../../core/hooks/useRerender";
import { IGridColumn } from "../../core/interfaces/IGridColumn";

export interface IColumnFilterConditionController {
    isAppliedToDataset: boolean,
    column: IGridColumn,
    value: {
        get: () => any;
        set: (value: any) => void;
    }
    operator: {
        get: () => DatasetConditionOperator | undefined;
        set: (operator: DatasetConditionOperator) => void;
    },
    remove: () => void;
    saveAndRefresh: () => void;
}

export const useColumnFilterConditionController = (column: IGridColumn): [
    IColumnFilterConditionController
] => {
    const grid = useGridInstance();
    const filtering = useGridInstance().filtering;
    const condition = useGridInstance().filtering.condition(column);
    const [operator, setOperator] = useState<DatasetConditionOperator>();
    const [value, setValue] = useState<any>();
    const controllerInstanceId = useMemo(() => crypto.randomUUID(), [])

    const saveAndRefresh = async () => {
        const expression = await filtering.getExpression();
        grid.dataset.filtering.setFilter(expression);
        grid.dataset.refresh();
    }

    const refresh = async () => {
        setOperator(await condition.operator.get());
        setValue(await condition.value.get());
    }

    useEffect(() => {
        condition.addRefreshCallback(controllerInstanceId, () => refresh());
        refresh();
        return () => {
            condition.removeRefreshCallback(controllerInstanceId);
            filtering.clear();
        }
    }, []);

    return [
        {
            isAppliedToDataset: condition.isAppliedToDataset,
            column: condition.column,
            operator: {
                get: () => operator,
                set: (operator) => () => condition.operator.set(operator)
            },
            value: {
                get: () => value,
                set: (value) => () => condition.value.set(value)
            },
            remove: () => condition.remove(),
            saveAndRefresh: () => saveAndRefresh()
        }
    ]

}