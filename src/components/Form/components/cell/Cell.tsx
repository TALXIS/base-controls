import * as React from "react";
import { Icon, Label, TooltipHost, useTheme } from "@fluentui/react";
import { getCellStyles } from "./styles";
import { useSectionContext } from "../section";
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

export const CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT = 280;

export const Cell = (props: ICellProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const section = useSectionContext();
    const theme = useTheme();
    const requirementLevel = RequiredLevelEnum.SystemRequired
    const { showLabel = true, label, disabled, id } = props;

    const { columnsPerRow } = useCalculatedColumns({
        breakpoints: Layout.createDefaultColumnBreakpoints(),
        ref: containerRef,
        onGetNumberOfColumnsForWidth: (containerWidth) => getNumberOfColumnsForWidth(containerWidth)
    });

    //@ts-ignore
    const shouldRenderRequiredIndicator = requirementLevel && requirementLevel !== RequiredLevelEnum.None;
    const shouldRenderLabel = (showLabel && label) || shouldRenderRequiredIndicator;
    const shouldRenderLabelContainer = shouldRenderLabel || disabled;
    const layoutStyle = Layout.getColumnStyles(props.colspan, section?.columnsPerRow);
    const cellLabelPosition = columnsPerRow > 1 ? 'Left' : section?.cellLabelPosition ?? 'Top';
    const styles = getCellStyles({ cell: props, section, cellLabelPosition, theme, requirementLevel});
    const [shouldRenderLockSpacer, setShouldRenderLockSpacer] = React.useState(false);

    const getNumberOfColumnsForWidth = (containerWidth: number) => {
        if(section?.cellLabelPosition === 'Top') return 1;
        return containerWidth <= CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT ? 1 : 2;
    }


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
                {shouldRenderLockSpacer && <div className={styles.lockSpacer}>
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