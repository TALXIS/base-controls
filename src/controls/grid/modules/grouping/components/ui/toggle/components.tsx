import { CellUi, ICellUiCommandsProps } from "@controls/grid/components/cells/ui";

/** The replaceable pieces of what opens and closes one group. */
export interface IGroupingUiToggleComponents {
    /** What the chevron is drawn in, `CellUi.Commands` by default. */
    onRenderCommands: (props: ICellUiCommandsProps) => JSX.Element | null;
}

/** The defaults for {@link IGroupingUiToggleComponents}. */
export const GroupingUiToggleComponents: IGroupingUiToggleComponents = {
    onRenderCommands: props => <CellUi.Commands {...props} />,
};
