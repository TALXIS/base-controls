/** The replaceable pieces of how many records a group holds. */
export interface IGroupingUiCountComponents {
    onRender: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IGroupingUiCountComponents}. */
export const GroupingUiCountComponents: IGroupingUiCountComponents = {
    onRender: props => <span {...props} />,
};
