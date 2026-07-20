import * as React from "react";
import { Icon, Label, TooltipHost, useTheme } from "@fluentui/react";
import { getCellStyles } from "./styles";
import { ISectionContext, useSectionContext } from "../section";
import { TextField } from "@talxis/react-components";
import { Layout } from "../../layout";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { useFieldContext } from "../field/context";

export interface ICellProps {
    id?: string;
    labelId?: string;
    label?: string;
    lockLevel?: number;
    visible?: boolean;
    colspan?: number;
    rowspan?: number;
    userspacer?: boolean;
    requiredLevel?: RequiredLevelEnum;
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

export const Cell = (props: ICellProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const section = useSectionContext();
    const field = useFieldContext();
    const theme = useTheme();
    const { label = field?.getColumn().displayName, disabled = field?.isDisabled(), id, requiredLevel = field?.isDisabled() ? RequiredLevelEnum.SystemRequired : RequiredLevelEnum.None, rowspan } = props;
    const shouldRenderLabelWrapper = label || disabled
    const layoutStyle = Layout.getColumnStyles(props.colspan, section?.columnsPerRow);

    const styles = getCellStyles({
        requiredLevel: requiredLevel,
        section,
        theme,
        label,
        rowspan
    });

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
                {requiredLevel !== RequiredLevelEnum.None && label &&
                    <div className={styles.requiredLevelMark}>
                        {requiredLevel !== RequiredLevelEnum.Recommended ?
                            <span >*</span> :
                            <Icon className={styles.recommendedMark} iconName='Add' />
                        }
                    </div>
                }
                {disabled && <Icon iconName="Lock" className={styles.lockIndicator} />}

            </div>
        }

        <div className={styles.control}>
            <TextField value="" />
        </div>
    </div>
}