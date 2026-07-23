import { Formatting, IColumn, IField, Sanitizer } from "@talxis/client-libraries";
import { NestedControlRenderer } from "../../../NestedControlRenderer";
import { useFieldContext } from "../field/context";
import { BaseControls } from "../../../../utils";
import { getControlStyles } from "./styles";
import { useMemo } from "react";
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

const createMockPcfContext = (
    overrides: Partial<ComponentFramework.Context<any>> = {}
): ComponentFramework.Context<any> => {
    return {
        userSettings: {
            languageId: 1033,
        } as ComponentFramework.UserSettings,
        mode: {} as ComponentFramework.Mode,
        factory: {
            requestRender: () => undefined,
            createComponent: () => ({}) as any,
            bindDOMElement: () => undefined,
            unbindDOMComponent: () => undefined,
        } as any,
        webAPI: {
            createRecord: async () => {
                throw new Error("Mock PCF context does not implement webAPI.createRecord.");
            },
            deleteRecord: async () => {
                throw new Error("Mock PCF context does not implement webAPI.deleteRecord.");
            },
            retrieveMultipleRecords: async () => ({
                entities: [],
                nextLink: undefined,
            }),
            retrieveRecord: async () => {
                throw new Error("Mock PCF context does not implement webAPI.retrieveRecord.");
            },
            updateRecord: async () => {
                throw new Error("Mock PCF context does not implement webAPI.updateRecord.");
            },
            execute: async () => {
                throw new Error("Mock PCF context does not implement webAPI.execute.");
            },
        } as unknown as ComponentFramework.WebApi,
        utils: {
            getEntityMetadata: async () => ({
                Attributes: new Map(),
            }),
        } as any,
        resources: {} as ComponentFramework.Resources,
        events: {} as any,
        parameters: {},
        client: {} as ComponentFramework.Client,
        navigation: {} as ComponentFramework.Navigation,
        device: {} as ComponentFramework.Device,
        formatting: Formatting.Get(),
        fluentDesignLanguage: undefined,
        ...overrides,
    } as ComponentFramework.Context<any>;
}

const BoundControl = (props: IControlProps & {field: IField}) => {
    const { disabled = useDisabledContext(), field } = props;
    const form = useFormContext();
    const column = field.getColumn();
    const context = createMockPcfContext();
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
    const fieldName = useFieldContext();
    const field = useField(fieldName);

    if (!field) {
        return <div>Unbound control</div>
    }

    return <BoundControl {...props} field={field} />
}