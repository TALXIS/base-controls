import { CellUi, ICellUiCommandsProps } from "../ui";

/** The replaceable pieces of a cell's commands. */
export interface ICellCommandsComponents {
    /** What draws the commands. `CellUi.Commands` is what draws them by default. */
    onRenderCommands: (props: ICellUiCommandsProps) => JSX.Element;
}

/** The defaults for {@link ICellCommandsComponents}. */
export const CellCommandsComponents: ICellCommandsComponents = {
    onRenderCommands: props => <CellUi.Commands {...props} />,
};
