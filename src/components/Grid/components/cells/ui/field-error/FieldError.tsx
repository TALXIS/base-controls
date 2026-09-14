import { useMemo } from "react";
import { Icon, TooltipHost, useTheme } from "@fluentui/react";
import { getFieldErrorStyles } from "./styles";

export interface IFieldErrorProps {
    /** What is wrong with the value, in the words the record put it. */
    message: string;
}

/**
 * What a cell says about a value its record refuses: a mark in the cell, and the reason on hover.
 *
 * A tooltip rather than the message itself, because a row is one line tall and the message is a sentence.
 * The outline is drawn here too, as an overlay rather than a border, so a cell the record refuses is not a
 * cell of another size.
 */
export const FieldError = (props: IFieldErrorProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getFieldErrorStyles(theme), [theme]);

    return <>
        <div className={styles.outline} aria-hidden />
        <TooltipHost content={props.message} className={styles.fieldErrorRoot}>
            <Icon iconName='StatusErrorFull' className={styles.icon} aria-label={props.message} />
        </TooltipHost>
    </>;
};
