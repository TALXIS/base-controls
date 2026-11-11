import { useMemo } from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { getClassNames } from "@core";
import { IRibbonUiCommandBarComponents, RibbonUiCommandBarComponents } from "./components";
import { getRibbonUiCommandBarStyles } from "./styles";

export interface IRibbonUiCommandBarProps {
    items: ICommandBarItemProps[];
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    className?: string;
    components?: Partial<IRibbonUiCommandBarComponents>;
}

/** The commands as a command bar, fitted to the width it is given. */
export const RibbonUiCommandBar = (props: IRibbonUiCommandBarProps) => {
    const components = { ...RibbonUiCommandBarComponents, ...props.components };
    const styles = useMemo(() => getRibbonUiCommandBarStyles(), []);
    return components.onRender({
        items: props.items,
        className: getClassNames([styles.ribbon, props.className]),
        align: props.align,
    });
};
