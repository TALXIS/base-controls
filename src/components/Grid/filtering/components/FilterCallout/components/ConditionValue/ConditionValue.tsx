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
    const condition = useColumnFilterConditionController(props.column);
    if (!condition) {
        return <></>
    }
    return <InternalConditionValue {...condition} />
}

const InternalConditionValue = (controller: IColumnFilterConditionController) => {
    const componentContainerRef = useRef<HTMLDivElement>(null);
    const conditionComponentValue = useMemo(() => new ConditionComponentValue(controller), []);
    const column = conditionComponentValue.column;

    useEffect(() => {
        if (conditionComponentValue.get() === null) {
            const input = componentContainerRef.current?.querySelector('input')
            input?.focus()
        }
    }, [conditionComponentValue.get()])

    return (
        <div ref={componentContainerRef}>
            <Component
                column={column}
                value={conditionComponentValue.get()}
                onNotifyOutputChanged={(value) => conditionComponentValue.set(value)}
                shouldValidate={!controller.value.valid}
                additionalParameters={{
                    MultipleEnabled: {
                        raw: true
                    }
                }}
            />
        </div>
    )
}
