import { Formatting, IColumn, IField, Sanitizer } from "@talxis/client-libraries";
import { NestedControlRenderer } from "../../../NestedControlRenderer";
import { useFieldContext } from "../field/context";
import { BaseControls, usePcfContext } from "../../../../utils";
import { getControlStyles } from "./styles";
import { useEffect, useMemo } from "react";
import { MessageBar, MessageBarType } from "@fluentui/react";
import { useFormContext } from "../form/context";
import { useField } from "../field";
import { useDisabledContext } from "../cell";



export interface IControlProps {
    id?: string;
    uniqueid?: string
    classid?: string;
    labelid?: string;
    datafieldname?: string;
    disabled?: boolean;
    addedby?: string;
    isunbound?: boolean;
    isrequired?: boolean;
    relationship?: string;
    indicationOfSubgrid?: boolean;
    parameters?: any
}

const getControlValue = (column: IColumn, value: any): any => {
    switch (column.dataType) {
        case "TwoOptions": {
            if (typeof value === "string") {
                return value === "1";
            }
            return value;
        }
        case "OptionSet": {
            return value ? parseInt(value, 10) : null;
        }
        case "MultiSelectPicklist": {
            return value ? value.split(",").map((item: string) => parseInt(item, 10)) : null;
        }
        case "Lookup.Simple":
        case "Lookup.Customer":
        case "Lookup.Owner":
        case "Lookup.Regarding": {
            const lookupValue = value && !Array.isArray(value) ? [value] : value;
            return lookupValue?.map((item: ComponentFramework.EntityReference) => Sanitizer.Lookup.getLookupValue(item));
        }
        default: {
            return value;
        }
    }
}

const BoundControl = (props: IControlProps & { field: IField }) => {
    const { disabled = false, field } = props;
    const form = useFormContext();
    const column = field.getColumn();
    const context = usePcfContext();
    const validationResult = form.saveOperationPerformed ? field.isValid() : null;
    const styles = useMemo(() => getControlStyles(), []);

    const onNotifyOutputChanged = (outputs: any) => {
        field.setValue(outputs.value);
    }

    return <div className={styles.controlContainer}>
        <NestedControlRenderer
            context={context}
            parameters={{
                ControlName: BaseControls.GetControlNameForDataType(column.dataType),
                ControlStates: {
                    isControlDisabled: disabled
                },
                Bindings: {
                    value: {
                        type: column.dataType,
                        value: getControlValue(column, field.getValue()),
                        formattedValue: field.getFormattedValue(),
                        isStatic: false,
                        metadata: {
                            onOverrideMetadata: (metadata) => {
                                return column.metadata;
                            }
                        },
                        error: validationResult?.error,
                        errorMessage: validationResult?.errorMessage
                    }
                }
            }}
            onNotifyOutputChanged={onNotifyOutputChanged}
        />
        {validationResult?.error &&
            <MessageBar messageBarType={MessageBarType.error}>
                {validationResult.errorMessage}
            </MessageBar>
        }
    </div>
}

export const Control = (props: IControlProps) => {
    const { disabled = false } = props;
    const fieldName = useFieldContext();
    const field = useField(fieldName);
    const disabledContext = useDisabledContext();

    useEffect(() => {
        disabledContext?.onDisabledChange(disabled);
    }, [disabled, disabledContext?.onDisabledChange]);

    if (!field) {
        return <MessageBar messageBarType={MessageBarType.error}>
            Unbound controls are currently not supported.
        </MessageBar>
    }

    return <BoundControl {...props} field={field} />
}