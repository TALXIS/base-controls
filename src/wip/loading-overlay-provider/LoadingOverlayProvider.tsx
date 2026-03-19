import { ILoadingOverlayProviderComponents, components as defaultComponents } from "./components";
import { IOverlayProviderProps, OverlayProvider } from "../overlay-provider";
import { LoadingOverlayProviderComponentsContext } from "./context";

export interface ILoadingOverlayProviderProps extends IOverlayProviderProps {
    components?: Partial<ILoadingOverlayProviderComponents>;
}


export const LoadingOverlayProvider = (props: ILoadingOverlayProviderProps) => {
    const components = { ...defaultComponents, ...props.components };

    return <LoadingOverlayProviderComponentsContext.Provider value={components} >
        <OverlayProvider {...props} components={components} />
    </LoadingOverlayProviderComponentsContext.Provider>
}