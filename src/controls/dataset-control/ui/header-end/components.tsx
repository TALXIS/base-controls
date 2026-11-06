/** The replaceable pieces of the header's end region. */
export interface IDatasetControlUiHeaderEndComponents {
    /** The box of the header's end region. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiHeaderEndComponents}. */
export const DatasetControlUiHeaderEndComponents: IDatasetControlUiHeaderEndComponents = {
    onRenderContainer: props => <div {...props} />,
};
