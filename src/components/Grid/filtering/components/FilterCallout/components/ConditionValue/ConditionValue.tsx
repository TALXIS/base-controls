import { useEffect, useMemo, useRef, useState } from "react";
import { IGridColumn } from "../../../../../core/interfaces/IGridColumn";
import { IColumnFilterConditionController, useColumnFilterConditionController } from "../../../../controller/useColumnFilterConditionController";
import { ConditionComponentValue } from "./model/ConditionComponentValue";
import { Attribute, DataType } from "@talxis/client-libraries";
import { NestedControlRenderer } from "../../../../../../NestedControl/NestedControlRenderer";
import { useGridInstance } from "../../../../../core/hooks/useGridInstance";
import { BaseControls } from "../../../../../../../utils";
import { usePrevious } from "../../../../../../../hooks/usePrevious";

interface IConditionValue {
    column: IGridColumn;
}

export const ConditionValue = (props: IConditionValue) => {
    const condition = useColumnFilterConditionController(props.column);
    const [shouldRemount, setShouldRemount] = useState(false);
    const value = condition?.value.get();

    useEffect(() => {
        if(value === null) {
            setShouldRemount(true)
        }
    }, [value]);

    useEffect(() => {
        if(shouldRemount) {
            setShouldRemount(false);
        }
    }, [shouldRemount]);

    if (!condition || shouldRemount) {
        return <></>
    }

    return <InternalConditionValue {...condition} />
}

const InternalConditionValue = (controller: IColumnFilterConditionController) => {
    const componentContainerRef = useRef<HTMLDivElement>(null);
    const firstRenderRef = useRef(true);
    const controllerRef = useRef<IColumnFilterConditionController>(controller);
    const mountedRef = useRef(true);
    controllerRef.current = controller;
    const conditionComponentValue = useMemo(() => new ConditionComponentValue(controllerRef), []);
    const column = conditionComponentValue.column;
    const grid = useGridInstance();
    const previousOperator = usePrevious(controllerRef.current.operator.get());

    const getShouldShowError = (): boolean => {
        if (!controller.value.valid) {
            return true;
        }
        if (!firstRenderRef.current && conditionComponentValue.get() === null && previousOperator !== controllerRef.current.operator.get()) {
            return true;
        }
        return false;
    }

    const getParameters = (parameters: any) => {
        const result = {
            ...parameters,
            ShowErrorMessage: {
                raw: true
            },
            EnableTypeSuffix: {
                raw: false
            },
            MultipleEnabled: {
                raw: true
            }
        };
        if (shouldShowErrorRef.current) {
            result.value = {
                ...result.value,
                error: true,
                errorMessage: "I need a value!"
            }
        }
        if (conditionComponentValue.get() === null) {
            result.AutoFocus = {
                raw: true
            }
        }
        result.value = {
            ...result.value,
            getAllViews: async (entityName: string) => {
                //Might go to infinite loop
                return result.value.getAllViews(entityName, 1);
            }
        }
        return result;
    }
    const shouldShowErrorRef = useRef(true);
    shouldShowErrorRef.current = getShouldShowError();

    useEffect(() => {
        firstRenderRef.current = false;
        return () => {
            mountedRef.current = false;
        }
    }, []);

    return <div ref={componentContainerRef}>
        <NestedControlRenderer
            context={grid.pcfContext}
            parameters={{
                ControlName: BaseControls.GetControlNameForDataType(column.dataType as DataType),
                Bindings: {
                    value: {
                        isStatic: false,
                        type: column.dataType as DataType,
                        value: conditionComponentValue.get(),
                        onNotifyOutputChanged: (value) => {
                            if(!mountedRef.current) {
                                return;
                            }
                            conditionComponentValue.set(value);
                        },
                        metadata: {
                            attributeName: Attribute.GetNameFromAlias(column.name),
                            entityName: column.getEntityName()
                        }
                    },
                },
            }}
            onOverrideComponentProps={(props) => {
                return {
                    ...props,
                    onOverrideControlProps: () => {
                        return (props) => {
                            return {
                                ...props,
                                parameters: getParameters(props.parameters)
                            }
                        }
                    }
                }
            }}
        />
    </div>
}
