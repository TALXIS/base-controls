import { CellUi, ICellCommandsProps } from "../../ui";

/** The replaceable pieces of a cell's commands. */
export interface ICommandsComponents {
    /** What draws the commands. */
    onRenderCommands: (props: ICellCommandsProps) => JSX.Element;
}

/** The defaults for {@link ICommandsComponents}. */
export const CommandsComponents: ICommandsComponents = {
    onRenderCommands: props => <CellUi.Commands {...props} />,
};
