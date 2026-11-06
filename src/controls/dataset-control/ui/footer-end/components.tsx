/** The replaceable pieces of the footer's end region. */
export interface IDatasetControlUiFooterEndComponents {
    /** The box of the footer's end region. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiFooterEndComponents}. */
export const DatasetControlUiFooterEndComponents: IDatasetControlUiFooterEndComponents = {
    onRenderContainer: props => <div {...props} />,
};
