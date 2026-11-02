import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { OptionTag } from "@ui";
import { ITaskTooltipUiHeaderComponents, TaskTooltipUiHeaderComponents } from "./components";
import { getTaskTooltipUiHeaderStyles } from "./styles";

export interface ITaskTooltipUiHeaderStatus {
    text: string;
    /** The tag's colour; the theme's neutral one without it. */
    color?: string;
}

export interface ITaskTooltipUiHeaderProps {
    title: string;
    status?: ITaskTooltipUiHeaderStatus;
    components?: Partial<ITaskTooltipUiHeaderComponents>;
}

/** A title, with the status beside it as an option tag. */
export const TaskTooltipUiHeader = (props: ITaskTooltipUiHeaderProps) => {
    const components = { ...TaskTooltipUiHeaderComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTaskTooltipUiHeaderStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.header,
        children: <>
            {components.onRenderTitle({ className: styles.title, children: props.title })}
            {props.status && <OptionTag className={styles.status} label={props.status.text} color={props.status.color} components={components.status} />}
        </>,
    });
};
