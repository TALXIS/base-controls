import { useMemo, useRef } from "react";
import { IGridColumn } from "../../../../../core/interfaces/IGridColumn";
import { IColumnFilterConditionController, useColumnFilterConditionController } from "../../../../controller/useColumnFilterConditionController";
import { ConditionComponentValue } from "./model/ConditionComponentValue";
import { DataType, FieldValue } from "@talxis/client-libraries";
import { DateTime } from "../../../../../../DateTime";
import { useGridInstance } from "../../../../../core/hooks/useGridInstance";
import dayjs from "dayjs";
import { mergeStyles } from "@fluentui/react";

interface IConditionValue {
    column: IGridColumn;
}


//copied over the original so it wont get messed up, we need to create a new solution for filtering that is independent of the legacy control rendering
export const ConditionValueBetween = (props: IConditionValue) => {
    const condition = useColumnFilterConditionController(props.column);
    if (!condition) {
        return <></>
    }
    return <InternalConditionValue {...condition} />
}

const InternalConditionValue = (controller: IColumnFilterConditionController) => {
    const grid = useGridInstance();
    const componentContainerRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<IColumnFilterConditionController>(controller);
    controllerRef.current = controller;
    const conditionComponentValue = useMemo(() => new ConditionComponentValue(controllerRef), []);
    const column = conditionComponentValue.column;

    const getDateBetweenError = (value: any): string | undefined => {
        if (controller.shouldShowError() && !controller.value.valid) {
            const fieldValue = new FieldValue(value, column.dataType as DataType, {
                ...column.metadata,
                RequiredLevel: 1
            });
            if (fieldValue.isValid().error) {
                return fieldValue.isValid().errorMessage;
            }
        }
        return undefined;
    }

    const getDateBetweenValue = (value: any) => {
        if (!value) {
            return null;
        }
        const fieldValue = new FieldValue(value, column.dataType as DataType, column.metadata);
        if (fieldValue.isValid().error) {
            return value;
        }
        return dayjs(fieldValue.getValue()).startOf('day').toDate();
    }

    return (
        <div className={mergeStyles({
            display: 'flex',
            flexDirection: 'column',
            gap: 5
        })} ref={componentContainerRef}>
            <DateTime
                context={grid.pcfContext}
                parameters={{
                    EnableDeleteButton: {
                        raw: true
                    },
                    ShowErrorMessage: {
                        raw: true
                    },
                    value: {
                        error: !!getDateBetweenError(conditionComponentValue.get()?.[0]),
                        errorMessage: getDateBetweenError(conditionComponentValue.get()?.[0]),
                        raw: getDateBetweenValue(conditionComponentValue.get()?.[0]),
                        //@ts-ignore - typings
                        attributes: {
                            Format: "DateOnly",
                            Behavior: 1,
                        }
                    }
                }}
                onNotifyOutputChanged={(outputs) => conditionComponentValue.set([outputs.value, conditionComponentValue.get()?.[1]])}
            />
            <DateTime
                context={grid.pcfContext}
                parameters={{
                    EnableDeleteButton: {
                        raw: true
                    },
                    ShowErrorMessage: {
                        raw: true
                    },
                    value: {
                        error: !!getDateBetweenError(conditionComponentValue.get()?.[1]),
                        errorMessage: getDateBetweenError(conditionComponentValue.get()?.[1]),
                        raw: getDateBetweenValue(conditionComponentValue.get()?.[1]),
                        //@ts-ignore - typings
                        attributes: {
                            Format: "DateOnly",
                            Behavior: 1,
                        }
                    }
                }}
                onNotifyOutputChanged={(outputs) => conditionComponentValue.set([conditionComponentValue.get()?.[0], outputs.value])}
            />
        </div >
    )
}
