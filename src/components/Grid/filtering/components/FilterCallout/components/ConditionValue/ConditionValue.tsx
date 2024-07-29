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
    const controllerRef = useRef<IColumnFilterConditionController>(controller);
    controllerRef.current = controller;
    const conditionComponentValue = useMemo(() => new ConditionComponentValue(controllerRef), []);
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
                onOverrideControlProps={(props) => {
                    return {
                        ...props,
                        parameters: {
                            ...props.parameters,
                            MultipleEnabled: {
                                raw: true
                            },
                            IsInlineNewEnabled: {
                                raw: false
                            },
                            ShowErrorMessage: {
                                raw: true
                            },
                            value: {
                                ...props.parameters.value,
                                getAllViews: async (entityName: string) => {
                                    return props.parameters.value.getAllViews(entityName, 1);
                                }
                            }
                        }
                    }
                }}
            />
        </div>
    )
}
