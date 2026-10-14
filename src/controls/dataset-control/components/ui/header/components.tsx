import { IWrapCompactProviderProps, WrapCompactProvider } from "@utils";

/** The replaceable pieces of the header. */
export interface IHeaderUiComponents {
    /** The box of the header, which turns its parts compact once they no longer fit on one line. */
    onRenderContainer: (props: IWrapCompactProviderProps) => JSX.Element | null;
}

/** The defaults for {@link IHeaderUiComponents}. */
export const HeaderUiComponents: IHeaderUiComponents = {
    onRenderContainer: props => <WrapCompactProvider {...props} />,
};
