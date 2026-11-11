/** The replaceable pieces of a tree cell's indent. */
export interface ITaskGridUiTreeCellIndentComponents {
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ITaskGridUiTreeCellIndentComponents}. */
export const TaskGridUiTreeCellIndentComponents: ITaskGridUiTreeCellIndentComponents = {
    onRender: props => <div {...props} />,
};
