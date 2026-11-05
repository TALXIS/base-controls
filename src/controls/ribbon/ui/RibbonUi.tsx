import { useMemo } from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { getClassNames } from "@core";
import { IRibbonUiComponents, RibbonUiComponents } from "./components";
import { getRibbonUiStyles } from "./styles";

export interface IRibbonUiProps {
    items: ICommandBarItemProps[];
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    className?: string;
    components?: Partial<IRibbonUiComponents>;
}

/** The commands as a command bar, fitted to the width it is given. */
export const RibbonUi = (props: IRibbonUiProps) => {
    const components = { ...RibbonUiComponents, ...props.components };
    const styles = useMemo(() => getRibbonUiStyles(), []);
    return components.onRenderCommandBar({
        items: props.items,
        className: getClassNames([styles.ribbon, props.className]),
        align: props.align,
    });
};
