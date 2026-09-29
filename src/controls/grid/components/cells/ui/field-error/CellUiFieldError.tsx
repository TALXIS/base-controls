import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { IAlignment } from "@utils";
import { CellUiFieldErrorComponents, ICellUiFieldErrorComponents } from "./components";
import { getFieldErrorStyles } from "./styles";

export interface ICellUiFieldErrorProps {
    /** What is wrong with the value, in the record's words. */
    message?: string;
    /** Which edge the cell's value reads from. */
    alignment?: IAlignment;
    components?: Partial<ICellUiFieldErrorComponents>;
}

/** What a cell says about a value its record refuses. */
export const CellUiFieldError = (props: ICellUiFieldErrorProps) => {
    const { message, alignment = 'left' } = props;
    const theme = useTheme();
    const styles = useMemo(() => getFieldErrorStyles(theme, alignment), [theme, alignment]);
    const components = { ...CellUiFieldErrorComponents, ...props.components };

    if (!message) {
        return null;
    }
    return <>
        {components.onRenderOutline({ className: styles.outline, 'aria-hidden': true })}
        {/* `TooltipHost` is styled by `hostClassName`, not `className` */}
        {components.onRenderTooltip({
            content: message,
            hostClassName: styles.fieldErrorRoot,
            children: components.onRenderIcon({ iconName: 'StatusErrorFull', className: styles.icon, 'aria-label': message }),
        })}
    </>;
};
