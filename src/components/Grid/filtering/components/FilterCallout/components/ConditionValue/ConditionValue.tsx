import { useMemo } from "react";
import { Component } from "../../../../../core/components/Component/Component";
import { IGridColumn } from "../../../../../core/interfaces/IGridColumn";
import { useColumnFilterConditionController } from "../../../../controller/useColumnFilterConditionController";
import { ConditionValue as ConditionValueModel } from "./model/ConditionValue";
import React from 'react';

interface IConditionValue {
    column: IGridColumn;
}

export const ConditionValue = (props: IConditionValue) => {
    const [filtering] = useColumnFilterConditionController(props.column);
    const conditionValue = useMemo(() => new ConditionValueModel(filtering), []);
    const column = conditionValue.column;

    return <Component
        column={column}
        value={conditionValue.get()}
        onNotifyOutputChanged={(value) => conditionValue.set(value)}
     />

};