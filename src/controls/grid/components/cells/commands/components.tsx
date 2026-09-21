import { CellUi, ICellCommandsProps } from "../ui";

/** The replaceable pieces of a cell's commands. */
export interface IGridCellCommandsComponents {
    /** What draws the commands. `CellUi.Commands` is what draws them by default. */
    onRenderCommands: (props: ICellCommandsProps) => JSX.Element;
}

/** The defaults for {@link IGridCellCommandsComponents}. */
export const CellCommandsComponents: IGridCellCommandsComponents = {
    onRenderCommands: props => <CellUi.Commands {...props} />,
};
