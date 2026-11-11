import { Panel, PanelGroup, PanelGroupProps, PanelProps, PanelResizeHandle, PanelResizeHandleProps } from "react-resizable-panels";

/** The replaceable pieces of the split between the grid and the Gantt. */
export interface IGridGanttUiSplitComponents {
    /** Holds both panes and the handle between them. */
    onRender: (props: PanelGroupProps) => JSX.Element | null;
    onRenderGridPane: (props: PanelProps) => JSX.Element | null;
    onRenderGanttPane: (props: PanelProps) => JSX.Element | null;
    onRenderHandle: (props: PanelResizeHandleProps) => JSX.Element | null;
}

/** The defaults for {@link IGridGanttUiSplitComponents}. */
export const GridGanttUiSplitComponents: IGridGanttUiSplitComponents = {
    onRender: props => <PanelGroup {...props} />,
    onRenderGridPane: props => <Panel {...props} />,
    onRenderGanttPane: props => <Panel {...props} />,
    onRenderHandle: props => <PanelResizeHandle {...props} />,
};
