import * as React from "react";
import type { FormXmlCell } from "@talxis/client-metadata";
import { useFormInstance } from "../useFormInstance";
import { useFieldValidation } from "../useFieldValidation";
import { UnsupportedControlError } from "../errors/UnsupportedControlError";
import { isStandardControlClassId } from "./standardControlClassIds";
import { FieldInput } from "./FieldInput";

export interface IFormCellProps {
    cell: FormXmlCell;
}

/**
 * Renders a single cell from the formXml. For MVP:
 * - If the cell has no control, render nothing.
 * - If the control is a known standard datafield-bound control, render label + input.
 * - Otherwise (custom / unknown control), throw `UnsupportedControlError`.
 */
export const FormCell: React.FC<IFormCellProps> = ({ cell }) => {
    const form = useFormInstance();
    const control = cell.control;

    if (!control) {
        return null;
    }

    if (!isStandardControlClassId(control.classid)) {
        throw new UnsupportedControlError({
            cellId: cell.id,
            classId: control.classid,
            controlName: (control as any).name,
        });
    }

    const datafieldname = control.datafieldname;
    if (!datafieldname || !control.classid) {
        // Standard classid without a datafieldname is treated as unsupported for MVP.
        throw new UnsupportedControlError({
            cellId: cell.id,
            classId: control.classid,
            controlName: (control as any).name,
        });
    }

    const label = form.getFieldLabel(datafieldname, control);
    const disabled = (control as any).disabled === true || (control as any).disabled === "true";

    let required = false;
    try {
        required = form.getAttributeConfiguration(datafieldname).requiredLevel === 'required';
    } catch {
        required = false;
    }

    const { result: validation } = useFieldValidation(datafieldname);

    return (
        <div data-id={`${control.id ?? ''}.fieldControl_container`}>
            <label htmlFor={`field-${datafieldname}`}>
                {label}
                {required ? <span data-id="required-indicator" aria-hidden="true"> *</span> : null}
            </label>
            <FieldInput
                classid={control.classid}
                datafieldname={datafieldname}
                controlId={control.id}
                disabled={disabled}
            />
            {validation.error ? (
                <div data-id={`${control.id ?? ''}.error`} role="alert">
                    {validation.errorMessage}
                </div>
            ) : null}
        </div>
    );
};
