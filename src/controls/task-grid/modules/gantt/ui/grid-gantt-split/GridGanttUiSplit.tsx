import { useTheme } from "@theme";
import { ReactNode, useMemo } from "react";

import { GridGanttUiSplitComponents, IGridGanttUiSplitComponents } from "./components";
import { getGridGanttUiSplitStyles } from "./styles";

export interface IGridGanttUiSplitProps {
    grid: ReactNode;
    gantt: ReactNode;
    /** The Gantt's share of the width in percent, read once at mount. */
    ganttSize: number;
    onGanttSizeChanged: (size: number) => void;
    components?: Partial<IGridGanttUiSplitComponents>;
}

/** Two panes side by side, the grid's and the Gantt's, resizable between them. */
export const GridGanttUiSplit = (props: IGridGanttUiSplitProps) => {
    const components = { ...GridGanttUiSplitComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getGridGanttUiSplitStyles(theme), [theme]);

    return components.onRenderContainer({
        direction: 'horizontal',
        className: styles.root,
        onLayout: sizes => props.onGanttSizeChanged(sizes[1]),
        children: <>
            {components.onRenderGridPane({ defaultSize: 100 - props.ganttSize, minSize: 0, className: styles.grid, children: props.grid })}
            {components.onRenderHandle({ className: styles.handle })}
            {components.onRenderGanttPane({ defaultSize: props.ganttSize, minSize: 0, children: props.gantt })}
        </>,
    });
};
