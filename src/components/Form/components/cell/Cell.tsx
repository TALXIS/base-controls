import * as React from "react";
import { Icon, Label, MessageBar } from "@fluentui/react";
import { CellContext, FormCellContext } from "./context";
import { getCellStyles } from "./styles";
import { useSectionContext } from "../section";
import { useFormInstance } from "../../form/useFormInstance";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import type { IFormCellProps } from "../../form/FormModel";
import { useFormComponent } from "../../form/useFormComponent";

export type { IFormCellProps } from "../../form/FormModel";


export const Cell = (props: IFormCellProps) => {
    const section = useSectionContext();

    const cell = useFormComponent('Cell', props, section ? {
        name: 'Section',
        instance: section
    } : undefined);

    const isDisabled = true;
    const requirementLevel = RequiredLevelEnum.SystemRequired;
    const { showLabel = true, label } = props;

    //@ts-ignore
    const shouldRenderRequiredIndicator = requirementLevel && requirementLevel !== RequiredLevelEnum.None;
    const shouldRenderLabel = (showLabel && label) || shouldRenderRequiredIndicator;
    const shouldRenderLabelContainer = shouldRenderLabel || isDisabled;
    const styles = React.useMemo(() => getCellStyles(cell, section), [cell.visible]);

    return <div className={styles.cell} data-id={`cell-${cell.id}`}>
        <CellContext.Provider value={cell}>
            {shouldRenderLabelContainer &&
                <div className={styles.labelContainer}>
                    {isDisabled && <Icon iconName="Lock" />}
                    {shouldRenderLabel &&
                        <Label required={shouldRenderRequiredIndicator}>
                            {label}
                        </Label>
                    }
                </div>
            }
        </CellContext.Provider>
        <div>control</div>
    </div>
}

/* export const Cell = (props: IFormCellProps) => {
    const form = useFormInstance();
    const section = useSectionContext();

    const cell = useFormComponent('Cell', props, section ? {
        name: 'Section',
        instance: section
    } : undefined);

    const { visible = true, lockLevel, showLabel = true, label } = props;

    const styles = React.useMemo(() => getCellStyles(), []);
    const [isDisabled, setIsDisabled] = React.useState<boolean>(true);
    const requirementLevel = RequiredLevelEnum.SystemRequired;
    //@ts-ignore
    const shouRequiredIndicator = requirementLevel && requirementLevel !== RequiredLevelEnum.None;
    const shouldRenderLabel = (showLabel && label) || shouRequiredIndicator;
    const shouldRenderLabelContainer = shouldRenderLabel || isDisabled;

    const showRequiredIndicator = () => {
        //@ts-ignore
        return requirementLevel && requirementLevel !== RequiredLevelEnum.None;
    };


    return <FormCellContext.Provider value={{ ...props, onSetDisabled: setIsDisabled }}>
        <div className={styles.cell}>
            {shouldRenderLabelContainer &&
                <div className={styles.labelContainer}>
                    {isDisabled && <Icon iconName="Lock" />}
                    {shouldRenderLabel &&
                        <Label required={showRequiredIndicator()}>
                            {label}
                        </Label>
                    }
                </div>
            }
            <div>control</div>
        </div>
    </FormCellContext.Provider>;
} */
