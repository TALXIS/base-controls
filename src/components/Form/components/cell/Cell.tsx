import * as React from "react";
import { Icon, Label, TooltipHost, useTheme } from "@fluentui/react";
import { getCellStyles } from "./styles";
import { useSectionContext } from "../section";
import { Layout } from "../../layout";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { useFieldContext } from "../field/context";
import { Form } from "../../Form";
import { useField } from "../field";
import { DisabledContext } from "./context";

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
    auto?: boolean;
    addedBy?: string;
    children?: React.ReactNode;
}

export const Cell = (props: ICellProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const section = useSectionContext();
    const fieldName = useFieldContext();
    const field = useField(fieldName);
    const theme = useTheme();
    const [disabled, setDisabled] = React.useState<boolean>(false);

    const {
        id,
        rowspan,
        label = field?.getColumn().displayName,
        requiredLevel = Form.getRequiredLevelEnumFromXrm(field?.getRequiredLevel())
    } = props;

    const shouldRenderLabelWrapper = label || disabled
    const layoutStyle = Layout.getColumnStyles(props.colspan, section?.columnsPerRow);

    const styles = getCellStyles({
        requiredLevel: requiredLevel,
        section,
        theme,
        label,
        rowspan
    });

    const onDisabledChange = React.useCallback((newDisabled: boolean) => {
        if(newDisabled == disabled) return;
        setDisabled(newDisabled);
    }, []);

    return <div ref={containerRef} data-field-name={fieldName} className={styles.cell} style={layoutStyle}>
        <DisabledContext.Provider value={{ onDisabledChange }}>
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
                {props.children}
            </div>
        </DisabledContext.Provider>
    </div>
}