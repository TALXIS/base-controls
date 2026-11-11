/** The replaceable pieces of the container. */
export interface IDatasetControlUiContainerComponents {
    /** The control's outer box. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiContainerComponents}. */
export const DatasetControlUiContainerComponents: IDatasetControlUiContainerComponents = {
    onRender: props => <div {...props} />,
};
