import { useTheme } from "@theme";
import { useMemo } from "react";

import { OptionTag } from "@ui";
import { ITooltipUiHeaderComponents, TooltipUiHeaderComponents } from "./components";
import { getTooltipUiHeaderStyles } from "./styles";

export interface ITooltipUiHeaderStatus {
    text: string;
    /** The tag's colour, the theme's neutral one by default. */
    color?: string;
}

export interface ITooltipUiHeaderProps {
    title: string;
    status?: ITooltipUiHeaderStatus;
    components?: Partial<ITooltipUiHeaderComponents>;
}

/** A title, with the status beside it as an option tag. */
export const TooltipUiHeader = (props: ITooltipUiHeaderProps) => {
    const components = { ...TooltipUiHeaderComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTooltipUiHeaderStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.header,
        children: <>
            {components.onRenderTitle({ className: styles.title, children: props.title })}
            {props.status && <OptionTag className={styles.status} label={props.status.text} color={props.status.color} components={components.status} />}
        </>,
    });
};
