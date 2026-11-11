import { IWrapCompactProviderProps, WrapCompactProvider } from "@ui";

/** The replaceable pieces of the header. */
export interface IDatasetControlUiHeaderComponents {
    /** The box of the header, which turns its parts compact once they no longer fit on one line. */
    onRender: (props: IWrapCompactProviderProps) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiHeaderComponents}. */
export const DatasetControlUiHeaderComponents: IDatasetControlUiHeaderComponents = {
    onRender: props => <WrapCompactProvider {...props} />,
};
