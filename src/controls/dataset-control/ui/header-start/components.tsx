/** The replaceable pieces of the header's start region. */
export interface IDatasetControlUiHeaderStartComponents {
    /** The box of the header's start region. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiHeaderStartComponents}. */
export const DatasetControlUiHeaderStartComponents: IDatasetControlUiHeaderStartComponents = {
    onRender: props => <div {...props} />,
};
