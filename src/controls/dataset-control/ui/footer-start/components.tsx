/** The replaceable pieces of the footer's start region. */
export interface IDatasetControlUiFooterStartComponents {
    /** The box of the footer's start region. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiFooterStartComponents}. */
export const DatasetControlUiFooterStartComponents: IDatasetControlUiFooterStartComponents = {
    onRender: props => <div {...props} />,
};
