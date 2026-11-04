import { ICommandBarProps } from "@fluentui/react";
import { CommandBar } from "@ui";

/** The replaceable pieces of the commands a cell offers. */
export interface ICellUiCommandsComponents {
    /** What the bar is drawn in, and what is measured as the row resizes. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

/** The defaults for {@link ICellUiCommandsComponents}. */
export const CellUiCommandsComponents: ICellUiCommandsComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderCommandBar: props => <CommandBar {...props} />,
};
