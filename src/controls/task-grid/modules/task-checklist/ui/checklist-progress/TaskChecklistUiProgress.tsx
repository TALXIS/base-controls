import { useTheme } from "@theme";
import { useMemo } from "react";

import { TaskChecklistUiProgressComponents, ITaskChecklistUiProgressComponents } from "./components";
import { getTaskChecklistUiProgressStyles } from "./styles";

export interface ITaskChecklistUiProgressProps {
    completedCount: number;
    totalCount: number;
    components?: Partial<ITaskChecklistUiProgressComponents>;
}

/** How far a checklist has got, as `done/total`. */
export const TaskChecklistUiProgress = (props: ITaskChecklistUiProgressProps) => {
    const { completedCount, totalCount } = props;
    const components = { ...TaskChecklistUiProgressComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTaskChecklistUiProgressStyles(theme), [theme]);

    if (totalCount === 0) {
        return null;
    }
    return components.onRender({
        className: styles.root,
        children: <>
            {components.onRenderIcon({ iconName: 'Completed', className: completedCount === totalCount ? styles.completedIcon : styles.icon })}
            {components.onRenderText({ children: `${completedCount}/${totalCount}` })}
        </>,
    });
};
