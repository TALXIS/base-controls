import { useMemo } from "react";
import { Icon, useTheme } from "@fluentui/react";
import { TooltipHost } from "@ui";
import { getFieldErrorStyles } from "./styles";

export interface IFieldErrorProps {
    /** What is wrong with the value, in the words the record put it. */
    message: string;
}

/** What a cell says about a value its record refuses */
export const FieldError = (props: IFieldErrorProps) => {
    const { message } = props;
    const theme = useTheme();
    const styles = useMemo(() => getFieldErrorStyles(theme), [theme]);

    return <>
        <div className={styles.outline} aria-hidden />
        {/* `hostClassName`, not `className`: what a `TooltipHost` is styled by is the former, and the
            latter reaches nothing */}
        <TooltipHost content={message} hostClassName={styles.fieldErrorRoot}>
            <Icon iconName='StatusErrorFull' className={styles.icon} aria-label={message} />
        </TooltipHost>
    </>;
};
