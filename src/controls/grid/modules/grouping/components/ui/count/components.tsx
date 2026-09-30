/** The replaceable pieces of how many records a group holds. */
export interface IGroupingUiCountComponents {
    onRenderCount: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IGroupingUiCountComponents}. */
export const GroupingUiCountComponents: IGroupingUiCountComponents = {
    onRenderCount: props => <span {...props} />,
};
