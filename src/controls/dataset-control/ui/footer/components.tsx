/** The replaceable pieces of the footer. */
export interface IDatasetControlUiFooterComponents {
    /** The box of the footer. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiFooterComponents}. */
export const DatasetControlUiFooterComponents: IDatasetControlUiFooterComponents = {
    onRender: props => <div {...props} />,
};
