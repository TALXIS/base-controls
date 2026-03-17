import { Overlay } from "@fluentui/react";
import { useMemo } from "react";
import { getLoadingOverlayStyles } from "./styles";
import { LoadingOverlayContext } from "./useLoadingOverlay";
import React from "react";
import { ILoadingOverlayProviderComponents, components as defaultComponents } from "./components";

interface ILoadingOptions {
    isLoading: boolean;
    message?: string;
}

export interface ILoadingOverlayProviderProps {
    children?: React.ReactNode;
    components?: Partial<ILoadingOverlayProviderComponents>;
}

export const LoadingOverlayProvider = (props: ILoadingOverlayProviderProps) => {
    const { children } = props;
    const styles = useMemo(() => getLoadingOverlayStyles(), []);
    const [options, setOptions] = React.useState<ILoadingOptions>({ isLoading: false });
    const { isLoading, message } = options;
    const components = { ...defaultComponents, ...props.components };

    const toggle = (options: ILoadingOptions) => {
        setOptions(options);
    }

    return <LoadingOverlayContext.Provider value={{ toggle }}>
        <components.Container className={styles.loadingOverlayContainer}>
            {children}
            {isLoading &&
                <Overlay className={styles.loadingOverlay}>
                    <components.Spinner label={message} />
                </Overlay>
            }
        </components.Container>
    </LoadingOverlayContext.Provider>
}