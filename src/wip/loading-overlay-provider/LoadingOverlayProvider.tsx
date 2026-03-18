import { useMemo, useRef } from "react";
import { getLoadingOverlayStyles } from "./styles";
import React from "react";
import { ILoadingOverlayProviderComponents, components as defaultComponents } from "./components";
import { LoadingOverlayInternalContext } from "./context";

export interface ILoadingOptions {
    isVisible: boolean;
    message?: string;
}

export interface ILoadingOverlayProviderProps {
    options?: ILoadingOptions;
    children?: React.ReactNode;
    components?: Partial<ILoadingOverlayProviderComponents>;
}

export const LoadingOverlayProvider = (props: ILoadingOverlayProviderProps) => {
    const { children } = props;
    const isControlled = useRef(!!props.options).current;
    const styles = useMemo(() => getLoadingOverlayStyles(), []);
    const [_loadingOptions, setOptions] = React.useState<ILoadingOptions>({ isVisible: false });
    const loadingOptions = props.options ?? _loadingOptions;
    const { isVisible, message } = loadingOptions;
    const components = { ...defaultComponents, ...props.components };

    const toggle = (options: ILoadingOptions) => {
        if (isControlled) {
            console.warn("LoadingOverlayProvider is in controlled mode since options prop is provided. Calls to toggle will not have any effect.")
        }
        else {
            setOptions(options);
        }
    }

    if (isControlled !== !!props.options) {
        console.error("LoadingOverlayProvider: cannot switch between controlled and uncontrolled modes.");
    }


    return <LoadingOverlayInternalContext.Provider value={{ toggle, isVisible, message }}>
        <components.Container className={styles.loadingOverlayContainer}>
            {children}
            {isVisible &&
                <components.Overlay className={styles.loadingOverlay}>
                    <components.Spinner label={message} />
                </components.Overlay>
            }
        </components.Container>
    </LoadingOverlayInternalContext.Provider>
}