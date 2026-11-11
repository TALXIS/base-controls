import { Grid, ICellEmptyRendererProps } from "@controls/grid";
import { TaskGridUiCommandBar, TaskGridUiCommandsContainer } from "../../ui";
import type { ITaskCommandsCellComponents } from "./components";

/** Props for {@link TaskCommandsCell}. */
export interface ITaskCommandsCellProps extends ICellEmptyRendererProps { }

/** The cell of a task's row commands, the first spanning the cell and the rest in its menu. */
export const TaskCommandsCell = (props: ITaskCommandsCellProps) => {
    const components: ITaskCommandsCellComponents = props.components ?? {};
    return <Grid.Cell.EmptyRenderer {...props} components={{
        ...components,
        commands: {
            onRender: containerProps => <TaskGridUiCommandsContainer {...containerProps} components={components.commands} />,
            onRenderCommandBar: commandBarProps => <TaskGridUiCommandBar {...commandBarProps} components={components.commands} />,
        },
    }} />;
};
