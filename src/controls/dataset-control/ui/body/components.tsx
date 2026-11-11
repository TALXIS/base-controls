/** The replaceable pieces of the body. */
export interface IDatasetControlUiBodyComponents {
    /** The box of the body. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiBodyComponents}. */
export const DatasetControlUiBodyComponents: IDatasetControlUiBodyComponents = {
    onRender: props => <div {...props} />,
};
