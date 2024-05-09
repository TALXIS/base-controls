import { useEffect, useState } from "react";
import { DatasetConditionOperator } from "../../core/enums/ConditionOperator";
import { useGridInstance } from "../../core/hooks/useGridInstance"
import { useRefreshCallback } from "../../core/hooks/useRefreshCallback";
import { useRerender } from "../../core/hooks/useRerender";
import { IGridColumn } from "../../core/interfaces/IGridColumn";

export interface IColumnFilterConditionController {
    loaded: boolean,
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
    clear: () => Promise<void>;
}

export const useColumnFilterConditionController = (column: IGridColumn):IColumnFilterConditionController => {
    const filtering = useGridInstance().filtering;
    const condition = filtering.condition(column);
    const [operator, setOperator] = useState<DatasetConditionOperator>();
    const [value, setValue] = useState<any>();
    const [loaded, setLoaded] = useState<boolean>(false);
    const [rerender, renderDecorator] = useRerender();

    const refresh = async () => {
        setOperator(await condition.operator.get());
        setValue(await condition.value.get());
        renderDecorator();
    }

    useRefreshCallback(condition, refresh);

    useEffect(() => {
        (async () => {
            await refresh();
            setLoaded(true);
        })();
    }, []);

    return  {
        isAppliedToDataset: condition.isAppliedToDataset,
        column: condition.column,
        loaded: loaded,
        operator: {
            get: () => operator,
            set: (operator) => condition.operator.set(operator)
        },
        value: {
            valid: condition.isValid,
            get: () => value,
            set: (value) => condition.value.set(value)
        },
        remove: () => condition.remove(),
        save: () => condition.save(),
        clear: () => condition.clear()
    }

}