import * as React from "react";
import { useFieldValidation } from "./form/useFieldValidation";
import { useFormInstance } from "./form/useFormInstance";
import { useFormUiState } from "./form/useFormUiState";
import { FormCellContext } from "./FormCellContext";

export interface IFormCellProps {
    id?: string;
    controlId?: string;
    datafieldname?: string;
    label?: React.ReactNode;
    showLabel?: boolean;
    required?: boolean;
    disabled?: boolean;
    visible?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const Cell: React.FC<IFormCellProps> = ({
    id,
    controlId,
    datafieldname,
    label,
    showLabel = true,
    required,
    disabled,
    visible = true,
    className,
    children,
}) => {
    const form = useFormInstance();
    useFormUiState();

    if (visible === false) {
        return null;
    }

    if (controlId && form.getControlVisible(controlId) === false) {
        return null;
    }

    const labelOverride = controlId ? form.getControlLabel(controlId) : undefined;
    const resolvedLabel = label
        ?? labelOverride
        ?? (datafieldname ? form.getFieldLabel(datafieldname) : undefined);

    const disabledOverride = controlId ? form.getControlDisabled(controlId) : undefined;
    const resolvedDisabled = disabled !== undefined
        ? disabled
        : disabledOverride !== undefined
        ? disabledOverride
        : undefined;

    let resolvedRequired = required ?? false;
    if (required === undefined && datafieldname) {
        try {
            const override = controlId ? form.getRequiredLevelOverride(datafieldname) : undefined;
            if (override !== undefined) {
                resolvedRequired = override === "required";
            } else {
                resolvedRequired = form.getAttributeConfiguration(datafieldname).requiredLevel === "required";
            }
        } catch {
            resolvedRequired = false;
        }
    }

    const renderedChildren = injectDisabled(children, resolvedDisabled);

    return (
        <FormCellContext.Provider value={{ datafieldname, controlId, disabled: resolvedDisabled }}>
            <div data-id={`${controlId ?? id ?? datafieldname ?? "cell"}.fieldControl_container`} className={className}>
                {showLabel && resolvedLabel ? (
                    <label htmlFor={datafieldname ? `field-${datafieldname}` : undefined}>
                        {resolvedLabel}
                        {resolvedRequired ? <span data-id="required-indicator" aria-hidden="true"> *</span> : null}
                    </label>
                ) : null}
                {renderedChildren}
                {datafieldname ? (
                    <CellValidationMessage datafieldname={datafieldname} controlId={controlId} />
                ) : null}
            </div>
        </FormCellContext.Provider>
    );
};

const CellValidationMessage: React.FC<{ datafieldname: string; controlId?: string }> = ({ datafieldname, controlId }) => {
    const { result: validation } = useFieldValidation(datafieldname);

    return validation.error ? (
        <div data-id={`${controlId ?? datafieldname}.error`} role="alert">
            {validation.errorMessage}
        </div>
    ) : null;
};

const injectDisabled = (children: React.ReactNode, disabled: boolean | undefined): React.ReactNode => {
    if (disabled === undefined) {
        return children;
    }

    return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
            return child;
        }

        if ((child.props as { disabled?: boolean }).disabled !== undefined) {
            return child;
        }

        return React.cloneElement(child as React.ReactElement<any>, { disabled });
    });
};
