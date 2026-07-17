import * as React from "react";
import { Icon, Label, TooltipHost, useTheme } from "@fluentui/react";
import { getCellStyles } from "./styles";
import { ISectionContext, useSectionContext } from "../section";
import { TextField } from "@talxis/react-components";
import { Layout } from "../../layout";

export interface ICellProps {
    id?: string;
    labelId?: string;
    label?: string;
    lockLevel?: number;
    visible?: boolean;
    colspan?: number;
    rowspan?: number;
    userspacer?: boolean;
    requiredLevel?: "SystemRequired" | "ApplicationRequired" | "BusinessRequired";
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
    const { label, disabled, id, requiredLevel } = props;

    const shouldRenderLabelWrapper = label || requiredLevel || disabled
    const layoutStyle = Layout.getColumnStyles(props.colspan, section?.columnsPerRow);
    const cellLabelPosition = getCellLabelPosition(section);

    const styles = getCellStyles({ cell: props, section, cellLabelPosition, theme });

    return <div ref={containerRef} className={styles.cell} data-id={`cell-${id}`} style={layoutStyle}>
        {shouldRenderLabelWrapper &&
            <div className={styles.labelWrapper}>
                {label &&
                    <Label className={styles.labelText}>
                        <TooltipHost content={label}>
                            {label}
                        </TooltipHost>
                    </Label>
                }
                {requiredLevel && <span className={styles.requiredMark}>*</span>}
                {disabled && <Icon iconName="Lock" className={styles.lockIndicator} />}

            </div>
        }

        <div className={styles.control}>
            <TextField value="" />
        </div>
    </div>
}