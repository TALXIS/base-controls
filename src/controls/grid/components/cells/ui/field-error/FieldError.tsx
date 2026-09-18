import { useMemo } from "react";
import { Icon, ITheme, TooltipHost, useTheme } from "@fluentui/react";
import { getFieldErrorStyles } from "./styles";

export interface IFieldErrorProps {
    /** What is wrong with the value, in the words the record put it. */
    message: string;
    /** What the tooltip is drawn in. */
    surfaceTheme?: ITheme;
}

/** What a cell says about a value its record refuses */
export const FieldError = (props: IFieldErrorProps) => {
    const { message, surfaceTheme } = props;
    const theme = useTheme();
    const styles = useMemo(() => getFieldErrorStyles(theme), [theme]);

    return <>
        <div className={styles.outline} aria-hidden />
        {/* `hostClassName`, not `className`: what a `TooltipHost` is styled by is the former, and the
            latter reaches nothing */}
        <TooltipHost content={message} hostClassName={styles.fieldErrorRoot}
            tooltipProps={{ theme: surfaceTheme }} calloutProps={{ theme: surfaceTheme }}>
            <Icon iconName='StatusErrorFull' className={styles.icon} aria-label={message} />
        </TooltipHost>
    </>;
};
