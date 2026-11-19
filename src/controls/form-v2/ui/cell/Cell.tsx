import { useTheme } from "@theme";
import * as React from "react";
import { Icon, Label, MessageBar, MessageBarType } from "@fluentui/react";
import { TooltipHost } from "@ui";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { FormV2UiCellComponents, IFormV2UiCellComponents } from "./components";
import { getFormV2UiCellStyles } from "./styles";
import { useFormV2UiSectionBodyContext } from "../section";
import { Layout } from "../layout";

export interface IFormV2UiCellProps {
    name?: string;
    label?: string;
    colspan?: number;
    rowspan?: number;
    requiredLevel?: RequiredLevelEnum;
    /** Shows the lock beside the label. */
    disabled?: boolean;
    /** Hides the cell with CSS; what is inside stays mounted. */
    hidden?: boolean;
    /** Shown below the control. */
    errorMessage?: string;
    children?: React.ReactNode;
    /** Replacements for its slots. */
    components?: Partial<IFormV2UiCellComponents>;
}

/** One field with its label. */
export const FormV2UiCell = (props: IFormV2UiCellProps) => {
    const components = { ...FormV2UiCellComponents, ...props.components };
    const section = useFormV2UiSectionBodyContext();
    const theme = useTheme();
    const { rowspan, label, disabled, hidden, requiredLevel = RequiredLevelEnum.None } = props;
    const styles = getFormV2UiCellStyles({ requiredLevel, section, theme, label, rowspan, hidden });

    return components.onRender({
        className: styles.cell,
        'data-id': props.name ? `cell-${props.name}` : undefined,
        style: Layout.getColumnStyles(props.colspan, section?.columnsPerRow),
        children: <>
            {(label || disabled) && components.onRenderLabel({
                className: styles.labelWrapper,
                children: <>
                    {label && <Label className={styles.labelText}><TooltipHost content={label}>{label}</TooltipHost></Label>}
                    {requiredLevel !== RequiredLevelEnum.None && label &&
                        <div className={styles.requiredLevelMark}>
                            {requiredLevel !== RequiredLevelEnum.Recommended ? <span>*</span> : <Icon className={styles.recommendedMark} iconName='Add' />}
                        </div>
                    }
                    {disabled && <Icon iconName="Lock" className={styles.lockIndicator} />}
                </>,
            })}
            {components.onRenderControl({
                className: styles.cellControl,
                children: <>
                    {props.children}
                    {props.errorMessage && <MessageBar messageBarType={MessageBarType.error}>{props.errorMessage}</MessageBar>}
                </>,
            })}
        </>,
    });
};
