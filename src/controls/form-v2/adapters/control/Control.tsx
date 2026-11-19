import { IColumn, IField, Sanitizer } from "@talxis/client-libraries";
import { useEventEmitter, useRerender } from "@core";
import { BaseControls, usePcfContext } from "@pcf";
import { NestedControlRenderer } from "@fields/nested-control-renderer";
import type { IFormEvents } from "../../runtime/interfaces";
import { FormControl, IFormControlEvents } from "../../runtime/parts/control/FormControl";
import type { IFormTabEvents } from "../../runtime/parts/tab/FormTab";
import { FormV2Ui, IFormV2UiCellComponents } from "../../ui";
import { useFormV2, useProvideFormControl } from "../root";
import { useOptionalFormTab } from "../tab";
import { useOptionalFormSection } from "../section";

/** Props for `FormV2.Control`. */
export interface IControlProps {
    /** The column the control edits. */
    field: string;
    /** Unique among the form's controls; `form.controls.get(name)` finds it. Defaults to `field`. */
    name?: string;
    /** Initial value; defaults to the field's display name. */
    label?: string;
    /** Initial value; defaults to `true`. */
    visible?: boolean;
    /** Initial value; defaults to `false`. */
    disabled?: boolean;
    /** How many of the section's columns it spans. */
    colspan?: number;
    rowspan?: number;
    /** Replacements for the cell's slots. */
    components?: Partial<IFormV2UiCellComponents>;
}

/** A field with its label; the field's control is drawn once its tab has been opened. */
export const Control = (props: IControlProps) => {
    const form = useFormV2();
    const tab = useOptionalFormTab();
    const section = useOptionalFormSection();
    const name = props.name ?? props.field;
    const control = useProvideFormControl(name, () => new FormControl({
        name,
        field: form.getField(props.field),
        tab,
        section,
        label: props.label,
        visible: props.visible,
        disabled: props.disabled,
    }));
    const { rerender } = useRerender();

    useEventEmitter<IFormControlEvents>(control.events, ['onVisibleChanged', 'onDisabledChanged', 'onLabelChanged'], rerender);
    useEventEmitter<IFormTabEvents>(tab?.events, 'onLoaded', rerender);
    useEventEmitter<IFormEvents>(form.events, ['onAfterSave', 'onValidationSummaryChanged'], rerender);
    useEventEmitter<IFormEvents>(form.events, 'onFieldValueChanged', (fieldName: string) => fieldName === props.field && rerender());

    const validation = form.isSaveAttempted() ? form.getFieldValidation(props.field) : undefined;

    return <FormV2Ui.Cell
        name={name}
        label={control.getLabel()}
        colspan={props.colspan}
        rowspan={props.rowspan}
        requiredLevel={form.getFieldRequiredLevel(props.field)}
        disabled={control.isDisabled()}
        hidden={!control.isVisible()}
        errorMessage={validation?.error ? validation.errorMessage : undefined}
        components={props.components}>
        {(tab?.isLoaded() ?? true) && <FieldControl field={control.getField()} disabled={control.isDisabled()} error={validation} />}
    </FormV2Ui.Cell>;
};

interface IFieldControlProps {
    field: IField;
    disabled: boolean;
    error?: { error: boolean; errorMessage: string };
}

const getControlValue = (column: IColumn, value: any): any => {
    switch (column.dataType) {
        case "TwoOptions":
            return typeof value === "string" ? value === "1" : value;
        case "OptionSet":
            return value ? parseInt(value, 10) : null;
        case "MultiSelectPicklist":
            return value ? value.split(",").map((item: string) => parseInt(item, 10)) : null;
        case "Lookup.Simple":
        case "Lookup.Customer":
        case "Lookup.Owner":
        case "Lookup.Regarding": {
            const lookupValue = value && !Array.isArray(value) ? [value] : value;
            return lookupValue?.map((item: ComponentFramework.EntityReference) => Sanitizer.Lookup.getLookupValue(item));
        }
        default:
            return value;
    }
};

const FieldControl = (props: IFieldControlProps) => {
    const { field } = props;
    const column = field.getColumn();
    const context = usePcfContext();

    return <NestedControlRenderer
        context={context}
        parameters={{
            ControlName: BaseControls.GetControlNameForDataType(column.dataType),
            ControlStates: { isControlDisabled: props.disabled },
            Bindings: {
                value: {
                    type: column.dataType,
                    value: getControlValue(column, field.getValue()),
                    formattedValue: field.getFormattedValue(),
                    isStatic: false,
                    metadata: { onOverrideMetadata: () => column.metadata },
                    error: props.error?.error,
                    errorMessage: props.error?.errorMessage,
                },
            },
        }}
        onNotifyOutputChanged={outputs => field.setValue(outputs.value)} />;
};
