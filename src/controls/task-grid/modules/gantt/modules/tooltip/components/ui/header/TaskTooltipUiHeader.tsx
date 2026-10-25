import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { ITaskTooltipUiHeaderComponents, TaskTooltipUiHeaderComponents } from "./components";
import { getTaskTooltipUiHeaderStyles } from "./styles";

export interface ITaskTooltipUiHeaderStatus {
    text: string;
    /** The pill's colour; the theme's neutral one without it. */
    color?: string;
}

export interface ITaskTooltipUiHeaderProps {
    title: string;
    status?: ITaskTooltipUiHeaderStatus;
    components?: Partial<ITaskTooltipUiHeaderComponents>;
}

/** A title, with a status pill beside it. */
export const TaskTooltipUiHeader = (props: ITaskTooltipUiHeaderProps) => {
    const components = { ...TaskTooltipUiHeaderComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTaskTooltipUiHeaderStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.header,
        children: <>
            {components.onRenderTitle({ className: styles.title, children: props.title })}
            {props.status && components.onRenderStatus({
                className: styles.status,
                style: props.status.color ? { backgroundColor: props.status.color, color: theme.palette.white } : undefined,
                children: props.status.text,
            })}
        </>,
    });
};
