import { useEffect, useMemo, useRef } from "react";
import { Component } from "../../../../../core/components/Component/Component";
import { IGridColumn } from "../../../../../core/interfaces/IGridColumn";
import { IColumnFilterConditionController, useColumnFilterConditionController } from "../../../../controller/useColumnFilterConditionController";
import { ConditionComponentValue } from "./model/ConditionComponentValue";
import React from 'react';

interface IConditionValue {
    column: IGridColumn;
}

export const ConditionValue = (props: IConditionValue) => {
    const componentContainerRef = useRef<HTMLDivElement>(null);
    const conditionRef = useRef<IColumnFilterConditionController>();
    conditionRef.current = useColumnFilterConditionController(props.column);
    const conditionComponentValue = useMemo(() => new ConditionComponentValue(conditionRef as React.MutableRefObject<IColumnFilterConditionController>), []);
    const column = conditionComponentValue.column;

    useEffect(() => {
        if (conditionComponentValue.get() === null) {
            const input = componentContainerRef.current?.querySelector('input')
            input?.focus()
        }
    }, [conditionComponentValue.get()])

    console.log(conditionRef.current.value.valid)

    return (
        <div ref={componentContainerRef}>
            <Component
                column={column}
                value={conditionComponentValue.get()}
                onNotifyOutputChanged={(value) => conditionComponentValue.set(value)}
                shouldValidate={!conditionRef.current.value.valid}
                additionalParameters={{
                    AutoFocus: {
                        raw: true
                    }
                }}
            />
        </div>
    )

};