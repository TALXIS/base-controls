import { useMemo } from "react";
import { getClassNames } from "@core";
import { ITaskGridUiCommandsContainerComponents, TaskGridUiCommandsContainerComponents } from "./components";
import { getTaskGridUiCommandsContainerStyles } from "./styles";

export interface ITaskGridUiCommandsContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    components?: Partial<ITaskGridUiCommandsContainerComponents>;
}

/** The element a task's row commands are drawn in, spanning the cell. */
export const TaskGridUiCommandsContainer = (props: ITaskGridUiCommandsContainerProps) => {
    const { components: _, className, ...containerProps } = props;
    const components = { ...TaskGridUiCommandsContainerComponents, ...props.components };
    const styles = useMemo(() => getTaskGridUiCommandsContainerStyles(), []);
    return components.onRenderContainer({ ...containerProps, className: getClassNames([className, styles.container]) });
};
