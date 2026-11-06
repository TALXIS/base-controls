import { CommandBar, ICommandBarProps } from "@ui/command-bar";

/** The replaceable pieces of the ribbon's command bar. */
export interface IRibbonUiCommandBarComponents {
    /** Its `items` are the commands, for an override to add to. */
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

/** The defaults for {@link IRibbonUiCommandBarComponents}. */
export const RibbonUiCommandBarComponents: IRibbonUiCommandBarComponents = {
    onRenderCommandBar: props => <CommandBar {...props} />,
};
