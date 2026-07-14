import * as React from "react";
import { Icon, Label, MessageBar } from "@fluentui/react";
import { CellContext } from "./context";
import { getCellStyles } from "./styles";
import { useSectionContext } from "../section";
import { useFormInstance } from "../../form/useFormInstance";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import type { IFormCellProps, ISection, ISectionEvents } from "../../form/FormModel";
import { useFormComponent } from "../../form/useFormComponent";
import { useEventEmitter } from "../../../../hooks";
import { EventEmitter } from "@talxis/client-libraries";

export type { IFormCellProps } from "../../form/FormModel";

const containsDisabledCells = (section: ISection) => {
    return section.getCells().filter(cell => cell.visible !== false).some(cell => cell.disabled);
}


export const Cell = (props: IFormCellProps) => {
    const section = useSectionContext();

    const cell = useFormComponent('Cell', props, section ? {
        name: 'Section',
        instance: section
    } : undefined);

    const requirementLevel = RequiredLevelEnum.SystemRequired;
    const { showLabel = true, label, disabled } = props;

    //@ts-ignore
    const shouldRenderRequiredIndicator = requirementLevel && requirementLevel !== RequiredLevelEnum.None;
    const shouldRenderLabel = (showLabel && label) || shouldRenderRequiredIndicator;
    const shouldRenderLabelContainer = shouldRenderLabel || disabled;
    const styles = React.useMemo(() => getCellStyles(cell, section), [cell.visible, section?.labelWidth]);
    const dummyEmitter = React.useMemo(() => new EventEmitter<ISectionEvents>(), []);

    const [shouldRenderLockSpacer, setShouldRenderLockSpacer] = React.useState(false);

/*     const toggleLockSpacer = () => {
        if (!section) return;
        if (!disabled) {
            setShouldRenderLockSpacer(containsDisabledCells(section));
        }
    }

    useEventEmitter<ISectionEvents>(section?.events ?? dummyEmitter, 'onCellDisabledChanged', toggleLockSpacer); */

/*     React.useEffect(() => {
        toggleLockSpacer();
    }, []); */
    


    return <div className={styles.cell} data-id={`cell-${cell.id}`}>
        <CellContext.Provider value={cell}>
            {shouldRenderLabelContainer &&
                <div className={styles.labelContainer}>
                    {shouldRenderLabel &&
                        <Label required={shouldRenderRequiredIndicator} className={styles.label}>
                            {label}
                        </Label>
                    }
                    {disabled && <Icon className={styles.lockIcon} iconName="Lock" />}
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
