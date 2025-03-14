import { useEffect, useMemo, useRef } from "react";
import { IGridColumn } from "../../../../../core/interfaces/IGridColumn";
import { IColumnFilterConditionController, useColumnFilterConditionController } from "../../../../controller/useColumnFilterConditionController";
import { ConditionComponentValue } from "./model/ConditionComponentValue";
import { DataTypes, MemoryDataProvider } from "@talxis/client-libraries";
import { Component } from "../LegacyControlRendering/Component";
import { useRerender } from "@talxis/react-components";

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
        const memoryProvider = new MemoryDataProvider(
            [
                {
                    [column.name]: conditionComponentValue.get() ?? undefined,
                    id: "id",
                },
            ], {
                PrimaryIdAttribute: "id"
            }
        );
        memoryProvider.setColumns([
            {
                ...column,
                metadata: { ...(column.metadata as any), RequiredLevel: 0 },
            },
            {
                name: "id",
                displayName: "",
                dataType: DataTypes.SingleLineText,
                alias: "id",
                order: 0,
                visualSizeFactor: 0,
            },
        ]);
        const record = memoryProvider.refreshSync()[0];
        return record;
    }, []);

    record.setValue(column.name, conditionComponentValue.get())

    useEffect(() => {
        if (conditionComponentValue.get() === null) {
            const input = componentContainerRef.current?.querySelector('input')
            input?.focus()
        }
        if (!firstRenderRef.current) {
            record.expressions?.setRequiredLevelExpression(column.name, () => 'required');
        }
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
        }
    }, [conditionComponentValue.get()])

    useEffect(() => {
        if (!controller.value.valid) {
            record?.expressions?.setRequiredLevelExpression(column.name, () => 'required');
            rerender();
        }
    }, [controller.value.valid])


    return (
        <div ref={componentContainerRef}>
            <Component
                column={column}
                record={record}
                onNotifyOutputChanged={(value) => conditionComponentValue.set(value)}
            />
        </div>
    )
}
