import { CellUi, ICellCommandsProps } from "../ui";

/** The replaceable pieces of a cell's commands. */
export interface IGridCellCommandsComponents {
    /** What draws the commands. */
    onRenderCommands: (props: ICellCommandsProps) => JSX.Element;
}

/** The defaults for {@link IGridCellCommandsComponents}. */
export const CellCommandsComponents: IGridCellCommandsComponents = {
    onRenderCommands: props => <CellUi.Commands {...props} />,
};
