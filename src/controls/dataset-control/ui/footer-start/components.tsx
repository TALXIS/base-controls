/** The replaceable pieces of the footer's start region. */
export interface IDatasetControlUiFooterStartComponents {
    /** The box of the footer's start region. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiFooterStartComponents}. */
export const DatasetControlUiFooterStartComponents: IDatasetControlUiFooterStartComponents = {
    onRenderContainer: props => <div {...props} />,
};
