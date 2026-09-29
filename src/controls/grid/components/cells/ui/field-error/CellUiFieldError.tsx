import { useMemo } from "react";
import { Icon, useTheme } from "@fluentui/react";
import { TooltipHost } from "@ui";
import { getFieldErrorStyles } from "./styles";

export interface ICellUiFieldErrorProps {
    /** What is wrong with the value, in the record's words. */
    message?: string;
    children?: React.ReactNode;
}

/** What a cell says about a value its record refuses: wrap it around what draws the value. */
export const CellUiFieldError = (props: ICellUiFieldErrorProps) => {
    const { message, children } = props;
    const theme = useTheme();
    const styles = useMemo(() => getFieldErrorStyles(theme), [theme]);

    if (!message) {
        return <>{children}</>;
    }
    return <>
        {children}
        <div className={styles.outline} aria-hidden />
        {/* `TooltipHost` is styled by `hostClassName`, not `className` */}
        <TooltipHost content={message} hostClassName={styles.fieldErrorRoot}>
            <Icon iconName='StatusErrorFull' className={styles.icon} aria-label={message} />
        </TooltipHost>
    </>;
};
