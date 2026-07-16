import * as React from "react";
import { Icon, Label, TooltipHost, useTheme } from "@fluentui/react";
import { CellContext } from "./context";
import { getCellStyles } from "./styles";
import { useSectionContext } from "../section";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import type { ISection, ISectionEvents } from "../../form/FormModel";
import { useFormComponent } from "../../form/useFormComponent";
import { useEventEmitter } from "../../../../hooks";
import { EventEmitter } from "@talxis/client-libraries";
import { TextField } from "@talxis/react-components";

export interface ICellProps {
    id?: string;
    labelId?: string;
    label?: string;
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
    disabled?: boolean;
    auto?: boolean;
    addedBy?: string;
    children?: React.ReactNode;
}

const containsDisabledCells = (section: ISection) => {
    return section.getCells().filter(cell => cell.visible !== false).some(cell => cell.disabled);
}


export const Cell = (props: ICellProps) => {
    const section = useSectionContext();
    const cell = useFormComponent('Cell', props, section ? {
        name: 'Section',
        instance: section
    } : undefined);

    const requirementLevel = RequiredLevelEnum.SystemRequired
    const { showLabel = true, label, disabled } = props;
    const theme = useTheme();

    //@ts-ignore
    const shouldRenderRequiredIndicator = requirementLevel && requirementLevel !== RequiredLevelEnum.None;
    const shouldRenderLabel = (showLabel && label) || shouldRenderRequiredIndicator;
    const shouldRenderLabelContainer = shouldRenderLabel || disabled;
    const styles = getCellStyles({ cell, section, requirementLevel, theme, labelCollapseBreakpoint: 300, labelWidth: 115 });
    const dummyEmitter = React.useMemo(() => new EventEmitter<ISectionEvents>(), []);

    const [shouldRenderLockSpacer, setShouldRenderLockSpacer] = React.useState(false);

    const toggleLockSpacer = () => {
        if (!section) return;
        setShouldRenderLockSpacer(containsDisabledCells(section));
    }

    useEventEmitter<ISectionEvents>(section?.events ?? dummyEmitter, 'onCellDisabledChanged', toggleLockSpacer);

    React.useEffect(() => {
        toggleLockSpacer();
    }, []);


    return <div className={styles.cell} data-id={`cell-${cell.id}`}>
        <CellContext.Provider value={cell}>
            {shouldRenderLabelContainer &&
                <div className={styles.labelContainer}>
                    {shouldRenderLabel &&
                        <Label className={styles.label}>
                            <TooltipHost content={label}>
                                {label}
                            </TooltipHost>
                        </Label>
                    }
                    {shouldRenderRequiredIndicator && <span className={styles.requiredIndicator}>*</span>}
                    {shouldRenderLockSpacer && <div className={styles.lockSpacer}>
                        {disabled && <Icon iconName="Lock" className={styles.lockIcon} />}
                    </div>
                    }
                </div>
            }
        </CellContext.Provider>
        <div className={styles.control}>
            <TextField value="" />
        </div>
    </div>
}