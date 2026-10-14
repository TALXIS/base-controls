import { ICommandBarItemProps } from "@fluentui/react";
import { IRibbonUiComponents, RibbonUiComponents } from "./components";

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
    return components.onRenderCommandBar({
        items: props.items,
        className: props.className,
        align: props.align,
    });
};
