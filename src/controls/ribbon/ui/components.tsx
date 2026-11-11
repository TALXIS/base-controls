import { CommandBar, ICommandBarProps } from "@ui/command-bar";

/** The replaceable pieces of the ribbon's command bar. */
export interface IRibbonUiCommandBarComponents {
    /** Its `items` are the commands, for an override to add to. */
    onRender: (props: ICommandBarProps) => JSX.Element | null;
}

/** The defaults for {@link IRibbonUiCommandBarComponents}. */
export const RibbonUiCommandBarComponents: IRibbonUiCommandBarComponents = {
    onRender: props => <CommandBar {...props} />,
};
