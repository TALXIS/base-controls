import { ICommandBarProps } from "@fluentui/react";
import { CommandBar } from "@ui/command-bar";

/** The replaceable pieces of the ribbon's command bar. */
export interface IRibbonUiComponents {
    /** Its `items` are the commands, for an override to add to. */
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

/** The defaults for {@link IRibbonUiComponents}. */
export const RibbonUiComponents: IRibbonUiComponents = {
    onRenderCommandBar: props => <CommandBar {...props} />,
};
