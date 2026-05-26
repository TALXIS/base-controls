import * as React from "react";
import type { FormXmlCell } from "@talxis/client-metadata";
import { useFormInstance } from "../useFormInstance";
import { useFieldValidation } from "../useFieldValidation";
import { useFormUiState } from "../useFormUiState";
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
    useFormUiState();

    const control = cell.control;
    const controlId = control?.id ?? '';
    const datafieldname = control?.datafieldname ?? '';

    // All hooks must run unconditionally before any early return
    const { result: validation } = useFieldValidation(datafieldname);

    if (!control) {
        return null;
    }

    if (controlId && form.getControlVisible(controlId) === false) {
        return null;
    }

    if (!isStandardControlClassId(control.classid)) {
        throw new UnsupportedControlError({
            cellId: cell.id,
            classId: control.classid,
            controlName: (control as any).name,
        });
    }

    if (!datafieldname || !control.classid) {
        throw new UnsupportedControlError({
            cellId: cell.id,
            classId: control.classid,
            controlName: (control as any).name,
        });
    }

    const labelOverride = controlId ? form.getControlLabel(controlId) : undefined;
    const label = labelOverride ?? form.getFieldLabel(datafieldname, control);

    const disabledOverride = controlId ? form.getControlDisabled(controlId) : undefined;
    const disabled = disabledOverride !== undefined
        ? disabledOverride
        : ((control as any).disabled === true || (control as any).disabled === "true");

    let required = false;
    try {
        const override = controlId ? form.getRequiredLevelOverride(datafieldname) : undefined;
        if (override !== undefined) {
            required = override === 'required';
        } else {
            required = form.getAttributeConfiguration(datafieldname).requiredLevel === 'required';
        }
    } catch {
        required = false;
    }

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
