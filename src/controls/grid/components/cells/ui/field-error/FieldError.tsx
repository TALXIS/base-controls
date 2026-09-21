import { useMemo } from "react";
import { Icon, useTheme } from "@fluentui/react";
import { TooltipHost } from "@ui";
import { getFieldErrorStyles } from "./styles";

export interface IFieldErrorProps {
    /** What is wrong with the value, in the words the record put it. Nothing means the record takes it. */
    message?: string;
    children?: React.ReactNode;
}

/** What a cell says about a value its record refuses: wrap it around what draws the value. */
export const FieldError = (props: IFieldErrorProps) => {
    const { message, children } = props;
    const theme = useTheme();
    const styles = useMemo(() => getFieldErrorStyles(theme), [theme]);

    if (!message) {
        return <>{children}</>;
    }
    return <>
        {children}
        <div className={styles.outline} aria-hidden />
        {/* `hostClassName`, not `className`: what a `TooltipHost` is styled by is the former, and the
            latter reaches nothing */}
        <TooltipHost content={message} hostClassName={styles.fieldErrorRoot}>
            <Icon iconName='StatusErrorFull' className={styles.icon} aria-label={message} />
        </TooltipHost>
    </>;
};
