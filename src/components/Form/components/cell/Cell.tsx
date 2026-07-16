import * as React from "react";
import { Icon, Label, TooltipHost, useTheme } from "@fluentui/react";
import { getCellStyles } from "./styles";
import { ISectionContext, useSectionContext } from "../section";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { TextField } from "@talxis/react-components";
import { IColumnBreakpoints, Layout } from "../../layout";
import { useCalculatedColumns } from "../../layout/useCalculatedColumns";

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

//default in Power Apps
const CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT = 371;


const getCellLabelPosition = (section?: ISectionContext | null) => {
    const { cellLabelPosition = 'Left', containerWidth, cellLabelCollapseBreakpoint = CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT } = section ?? {};
    
    if (cellLabelPosition !== 'Left') {
        return 'Top';
    }

    return (containerWidth ?? 0) < cellLabelCollapseBreakpoint ? 'Top' : 'Left';
}

export const Cell = (props: ICellProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const section = useSectionContext();
    const theme = useTheme();
    const requirementLevel = RequiredLevelEnum.SystemRequired
    const { showLabel = true, label, disabled, id } = props;
    const {showLockSpacer = false} = {...section}

    //@ts-ignore
    const shouldRenderRequiredIndicator = requirementLevel && requirementLevel !== RequiredLevelEnum.None;
    const shouldRenderLabel = (showLabel && label) || shouldRenderRequiredIndicator;
    const shouldRenderLabelContainer = shouldRenderLabel || disabled;
    const layoutStyle = Layout.getColumnStyles(props.colspan, section?.columnsPerRow);
    const cellLabelPosition = getCellLabelPosition(section);

    const styles = getCellStyles({ cell: props, section, cellLabelPosition, theme, requirementLevel });

    return <div ref={containerRef} className={styles.cell} data-id={`cell-${id}`} style={layoutStyle}>
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
                {showLockSpacer && <div className={styles.lockSpacer}>
                    {disabled && <Icon iconName="Lock" className={styles.lockIcon} />}
                </div>
                }
            </div>
        }
        <div className={styles.control}>
            <TextField value="" />
        </div>
    </div>
}