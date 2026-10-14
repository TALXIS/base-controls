import { CompactProvider, ICompactProviderProps } from "@utils";

/** The replaceable pieces of the header. */
export interface IHeaderUiComponents {
    /** The box of the header, which decides whether its parts draw compact. */
    onRenderContainer: (props: ICompactProviderProps) => JSX.Element | null;
}

/** The defaults for {@link IHeaderUiComponents}. */
export const HeaderUiComponents: IHeaderUiComponents = {
    onRenderContainer: props => <CompactProvider {...props} />,
};
