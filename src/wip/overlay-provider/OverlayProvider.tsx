import { useMemo, useRef } from "react";
import { IOverlayProviderOptions, OverlayProviderInternalContext } from "./context";
import { getLoadingOverlayStyles } from "./styles";
import React from "react";
import { components as defaultComponents, IOverlayProviderComponents } from "./components";

export interface IOverlayProviderProps {
    options?: IOverlayProviderOptions
    children?: React.ReactNode;
    components?: Partial<IOverlayProviderComponents>;
}

export const OverlayProvider = (props: IOverlayProviderProps) => {
    const { children } = props;
    const isControlled = useRef(!!props.options).current;
    const styles = useMemo(() => getLoadingOverlayStyles(), []);
    const [_options, setOptions] = React.useState<IOverlayProviderOptions>({ isVisible: false });
    const loadingOptions = props.options ?? _options;
    const { isVisible, message } = loadingOptions;
    const components = { ...defaultComponents, ...props.components };

    const toggle = (options: IOverlayProviderOptions) => {
        if (isControlled) {
            console.warn("OverlayProvider is in controlled mode since options prop is provided. Calls to toggle will not have any effect.")
        }
        else {
            setOptions(options);
        }
    }

    return <OverlayProviderInternalContext.Provider value={{ toggle, isVisible, message }}>
        <components.Container title={isVisible ? message : undefined} className={styles.overlayContainer}>
            {children}
            {isVisible &&
                <components.Overlay className={styles.overlay} />
            }
        </components.Container>
    </OverlayProviderInternalContext.Provider>
}