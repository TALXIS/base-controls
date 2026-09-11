import { ICommandsComponents } from "../adapters/commands/components";
import { CellUi, ICellContainerProps } from "../ui";

/** The replaceable pieces of a cell's host. Override through `ICellHostProps.components`. */
export interface ICellHostComponents {
    /** The element the cell is drawn in, and what its theme reaches the content through. */
    onRenderContainer: (props: ICellContainerProps) => JSX.Element;
    /** What a cell shows while it is waiting. Called only while it is. */
    onRenderLoading: () => JSX.Element;
    /**
     * What a cell offers to do, drawn after what it shows. Called only where it offers any.
     *
     * Left out to keep the command bar the commands are drawn in today.
     */
    onRenderCommands?: ICommandsComponents['onRenderCommands'];
}

/** The defaults for {@link ICellHostComponents}. */
export const CellHostComponents: ICellHostComponents = {
    onRenderContainer: props => <CellUi.Container {...props} />,
    onRenderLoading: () => <CellUi.Loading />,
};
