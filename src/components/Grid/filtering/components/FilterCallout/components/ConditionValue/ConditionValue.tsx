import { useEffect, useMemo, useRef } from "react";
import { Component } from "../../../../../core/components/Component/Component";
import { IGridColumn } from "../../../../../core/interfaces/IGridColumn";
import { IColumnFilterConditionController, useColumnFilterConditionController } from "../../../../controller/useColumnFilterConditionController";
import { ConditionComponentValue } from "./model/ConditionComponentValue";
import { MemoryDataProvider } from "@talxis/client-libraries";
import { useRerender } from "../../../../../../../hooks/useRerender";

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
    const firstRenderRef = useRef(true);
    controllerRef.current = controller;
    const conditionComponentValue = useMemo(() => new ConditionComponentValue(controllerRef), []);
    const column = conditionComponentValue.column;
    const rerender = useRerender();

    const record = useMemo(() => {
        const memoryProvider = new MemoryDataProvider([{
            [column.name]: conditionComponentValue.get()
        }], [column], {
            entityMetadata: {
                PrimaryIdAttribute: column.name
            }
        });
        const record = memoryProvider.refresh()[0];
        return record;
    }, []);

    record.setValue(column.name, conditionComponentValue.get())

    useEffect(() => {
        if (conditionComponentValue.get() === null) {
            const input = componentContainerRef.current?.querySelector('input')
            input?.focus()
        }
        if(!firstRenderRef.current) {
            record.setRequiredLevel('required', column.name)
        }
        if(firstRenderRef.current) {
            firstRenderRef.current = false;
        }
    }, [conditionComponentValue.get()])

    useEffect(() => {
        if(!controller.value.valid) {
            record.setRequiredLevel('required', column.name);
            rerender();
        }
    }, [controller.value.valid])


    return (
        <div ref={componentContainerRef}>
            <Component
                column={column}
                record={record}
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
