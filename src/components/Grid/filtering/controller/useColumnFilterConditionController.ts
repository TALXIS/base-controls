import { useEffect, useMemo, useRef, useState } from "react";
import { DatasetConditionOperator } from "../../core/enums/ConditionOperator";
import { useGridInstance } from "../../core/hooks/useGridInstance"
import { useRefreshCallback } from "../../core/hooks/useRefreshCallback";
import { IGridColumn } from "../../core/interfaces/IGridColumn";

export interface IColumnFilterConditionController {
    isAppliedToDataset: boolean,
    column: IGridColumn,
    value: {
        valid: boolean;
        get: () => any;
        set: (value: any) => void;
    }
    operator: {
        get: () => DatasetConditionOperator | undefined;
        set: (operator: DatasetConditionOperator) => void;
    },
    remove: () => void;
    save: () => Promise<boolean>;
    clear: () => void;
}

export const useColumnFilterConditionController = (column: IGridColumn): IColumnFilterConditionController | null => {
    const filtering = useGridInstance().filtering;
    const conditionPromise = useMemo(() => filtering.condition(column), []);
    const [controller, setController] = useState<IColumnFilterConditionController>();
    
    const refresh = async () => {
        const condition = await conditionPromise;
        setController(prevState => ({
            ...prevState,
            isAppliedToDataset: condition.isAppliedToDataset,
            column: condition?.column,
            operator: {
                get: () => condition.operator.get(),
                set: (operator) => condition.operator.set(operator)
            },
            value: {
                valid: condition.isValid,
                get: () => condition.value.get(),
                set: (value) => condition.value.set(value)
            },
            remove: () => condition?.remove(),
            save: () => condition?.save(),
            clear: () => condition?.clear()
        }))
    }
    useRefreshCallback(conditionPromise, refresh);
    useEffect(() => {
        (async () => {
            refresh();
        })();
    }, []);


    if(!controller) {
        return null;
    }
    return controller;
}