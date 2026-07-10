import * as React from "react";
import { FormLayoutContext } from "./FormLayoutContext";
import { useRowContext } from "./RowContext";
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
    style?: React.CSSProperties;
    colspan?: number;
    rowspan?: number;
    userspacer?: boolean;
    labelWidth?: number;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";
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
    style,
    userspacer = false,
    labelWidth,
    cellLabelAlignment,
    cellLabelPosition,
    children,
}) => {
    useRowContext();

    const form = useFormInstance();
    const layout = React.useContext(FormLayoutContext);
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
    const resolvedLabelPosition = cellLabelPosition ?? layout.cellLabelPosition ?? "Top";
    const resolvedLabelAlignment = cellLabelAlignment ?? layout.cellLabelAlignment ?? "Left";
    const resolvedLabelWidth = labelWidth ?? layout.labelWidth;
    const outerStyle = getCellContainerStyle({
        baseStyle: style,
        labelPosition: resolvedLabelPosition,
        labelWidth: resolvedLabelWidth,
    });
    const contentStyle = resolvedLabelPosition === "Left"
        ? { minWidth: 0 }
        : undefined;

    return (
        <FormCellContext.Provider value={{ datafieldname, controlId, disabled: resolvedDisabled }}>
            <div
                data-id={`${controlId ?? id ?? datafieldname ?? "cell"}.fieldControl_container`}
                className={className}
                style={outerStyle}
            >
                {showLabel && resolvedLabel ? (
                    <label
                        htmlFor={datafieldname ? `field-${datafieldname}` : undefined}
                        style={{ textAlign: resolvedLabelAlignment.toLowerCase() as React.CSSProperties["textAlign"] }}
                    >
                        {resolvedLabel}
                        {resolvedRequired ? <span data-id="required-indicator" aria-hidden="true"> *</span> : null}
                    </label>
                ) : null}
                <div style={contentStyle}>
                    {userspacer ? <div aria-hidden="true" /> : renderedChildren}
                    {datafieldname ? (
                        <CellValidationMessage datafieldname={datafieldname} controlId={controlId} />
                    ) : null}
                </div>
            </div>
        </FormCellContext.Provider>
    );
};

interface ICellContainerStyleOptions {
    baseStyle?: React.CSSProperties;
    labelPosition: "Top" | "Left";
    labelWidth?: number;
}

const getCellContainerStyle = ({
    baseStyle,
    labelPosition,
    labelWidth,
}: ICellContainerStyleOptions): React.CSSProperties => {
    if (labelPosition === "Left") {
        const gridTemplateColumns = labelWidth
            ? `${labelWidth}px minmax(0, 1fr)`
            : "minmax(140px, max-content) minmax(0, 1fr)";

        return {
            ...baseStyle,
            display: "grid",
            gridTemplateColumns,
            alignItems: "start",
            columnGap: 12,
        };
    }

    return {
        ...baseStyle,
        display: "flex",
        flexDirection: "column",
        gap: 8,
    };
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
