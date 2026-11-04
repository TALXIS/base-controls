import { Grid, ICellEmptyRendererProps } from "@controls/grid";
import { useTaskGridContext } from "../../context";
import { TaskGridUiCommandBar, TaskGridUiCommandsContainer } from "../../ui";
import { mergeComponentNamespaces } from "../mergeComponentNamespaces";
import type { ITaskCommandsCellComponents } from "./components";

/** Props for {@link TaskCommandsCell}. */
export interface ITaskCommandsCellProps extends ICellEmptyRendererProps { }

/** The cell of a task's row commands, the first spanning the cell and the rest in its menu. */
export const TaskCommandsCell = (props: ITaskCommandsCellProps) => {
    const components = mergeComponentNamespaces<ITaskCommandsCellComponents>(useTaskGridContext().components.taskCommands, props.components);
    return <Grid.Cell.EmptyRenderer {...props} components={{
        ...components,
        commands: {
            onRenderContainer: containerProps => <TaskGridUiCommandsContainer {...containerProps} components={components.commands} />,
            onRenderCommandBar: commandBarProps => <TaskGridUiCommandBar {...commandBarProps} components={components.commands} />,
        },
    }} />;
};
