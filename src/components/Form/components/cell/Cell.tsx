import * as React from "react";
import { Label, useTheme } from "@fluentui/react";
import { FormCellContext } from "./context";
import { getCellStyles } from "./styles";
import { useSectionContext } from "../section";
import { useFieldValidation } from "../../form/useFieldValidation";
import { useFormInstance } from "../../form/useFormInstance";
import { useFormUiState } from "../../form/useFormUiState";
import { useRowContext } from "../row";

export interface IFormCellProps {
    id?: string;
    labelId?: string;
    lockLevel?: number;
    showLabel?: boolean;
    visible?: boolean;
    colspan?: number;
    rowspan?: number;
    userspacer?: boolean;
    availableForPhone?: boolean;
    isPreviewCell?: boolean;
    isStreamCell?: boolean;
    isChartCell?: boolean;
    isTileCell?: boolean;
    
    auto?: boolean;
    addedBy?: string;
    children?: React.ReactNode;
}

export const Cell = (props: IFormCellProps) => {
    const {visible = true, lockLevel, showLabel = true} = props;
    const form = useFormInstance();
    const [isDisabled, setIsDisabled] = React.useState<boolean>(false);
    //this information actually comes from the control below => the control should call a method from a context to set the lock
    

    return <FormCellContext.Provider value={{...props, onSetDisabled: setIsDisabled}}>
        <div>
    </FormCellContext.Provider>;
}


export const Cell2 = (props: IFormCellProps) => {
    useRowContext();

    const theme = useTheme();
    const form = useFormInstance();
    const section = useSectionContext();
    useFormUiState();
    const {
        id,
        labelId,
        lockLevel,
        showLabel = true,
        visible = true,
        colspan,
        rowspan,
        userspacer = false,
        availableForPhone,
        isPreviewCell,
        isStreamCell,
        isChartCell,
        isTileCell,
        auto,
        addedBy,
        children,
    } = props;
    const control = getControlProps(children);

    if (visible === false) {
        return null;
    }

    if (control?.id && form.getControlVisible(control.id) === false) {
        return null;
    }

    const labelOverride = control?.id ? form.getControlLabel(control.id) : undefined;
    const resolvedLabel = labelOverride
        ?? (control?.datafieldname ? form.getFieldLabel(control.datafieldname) : undefined);

    const disabledOverride = control?.id ? form.getControlDisabled(control.id) : undefined;
    const resolvedDisabled = control?.disabled !== undefined
        ? control.disabled
        : disabledOverride !== undefined
        ? disabledOverride
        : undefined;

    let resolvedRequired = control?.isrequired ?? false;
    if (control?.isrequired === undefined && control?.datafieldname) {
        try {
            const override = control.id ? form.getRequiredLevelOverride(control.datafieldname) : undefined;
            if (override !== undefined) {
                resolvedRequired = override === "required";
            } else {
                resolvedRequired = form.getAttributeConfiguration(control.datafieldname).requiredLevel === "required";
            }
        } catch {
            resolvedRequired = false;
        }
    }

    const renderedChildren = injectDisabled(children, resolvedDisabled);
    const resolvedLabelPosition = section.cellLabelPosition ?? "Top";
    const resolvedLabelAlignment = section.cellLabelAlignment ?? "Left";
    const resolvedLabelWidth = section.labelWidth;


    console.log(section.cellLabelTopBreakpoint);

    const styles = getCellStyles(
        theme,
        resolvedLabelPosition,
        resolvedLabelAlignment,
        resolvedLabelWidth,
        section.cellLabelTopBreakpoint,
        colspan,
        rowspan,
    );

    return (
        <FormCellContext.Provider value={props}>
            <div
                className={styles.cell}
                data-id={`${control?.id ?? id ?? control?.datafieldname ?? "cell"}.fieldControl_container`}
                data-label-id={labelId}
                data-lock-level={lockLevel}
                data-available-for-phone={availableForPhone}
                data-is-preview-cell={isPreviewCell}
                data-is-stream-cell={isStreamCell}
                data-is-chart-cell={isChartCell}
                data-is-tile-cell={isTileCell}
                data-auto={auto}
                data-added-by={addedBy}
            >
                    {showLabel && resolvedLabel ? (
                        <Label
                            htmlFor={control?.datafieldname ? `field-${control.datafieldname}` : undefined}
                            required={resolvedRequired}
                            className={styles.label}
                        >
                            {resolvedLabel}
                        </Label>
                    ) : null}
                    <div className={styles.content}>
                        {userspacer ? <div aria-hidden="true" /> : renderedChildren}
                        {control?.datafieldname ? (
                            <CellValidationMessage
                                datafieldname={control.datafieldname}
                                controlId={control.id}
                                className={styles.error}
                            />
                        ) : null}
                    </div>
            </div>
        </FormCellContext.Provider>
    );
};

const CellValidationMessage = ({
    datafieldname,
    controlId,
    className,
}: { datafieldname: string; controlId?: string; className?: string }) => {
    const { result: validation } = useFieldValidation(datafieldname);

    return validation.error ? (
        <div data-id={`${controlId ?? datafieldname}.error`} role="alert" className={className}>
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

interface IControlChildProps {
    id?: string;
    classid?: string;
    datafieldname?: string;
    disabled?: boolean;
    isrequired?: boolean;
}

const getControlProps = (children: React.ReactNode): IControlChildProps | null => {
    const controlChild = React.Children.toArray(children)
        .find((child): child is React.ReactElement<IControlChildProps> =>
            React.isValidElement<IControlChildProps>(child) && "classid" in child.props,
        );

    return controlChild?.props ?? null;
};
