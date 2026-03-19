import { IOverlayProviderProps, OverlayProvider } from "../overlay-provider";
import { components as defaultComponents } from "./components";

export const DisabledOverlayProvider = (props: IOverlayProviderProps) => {
    const components = { ...defaultComponents, ...props.components };
    
    return <OverlayProvider {...props} components={components} />
}