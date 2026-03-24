import { IOverlayProps, useTheme } from "@fluentui/react";
import { useCallback, useMemo } from "react";
import { getPanelStyles } from "./styles";
import { IPanelComponents } from "./components/components";
import { components as defaultComponents } from "./components/components";
import { PanelComponentsContext, PanelLabelsContext, PanelPropsContext } from "./context";
import { LoadingOverlayProviderContainer } from "./components/loading-overlay-provider-container";
import { LoadingOverlaySpinner } from "./components/loading-overlay-spinner/LoadingOverlaySpinner";
import { IPanelLabels } from "./labels";
import { PANEL_LABELS } from "./labels";
import { ScrollableContainer } from "./components/scrollable-container";
import { IOverlayProviderOptions } from "../overlay-provider";

export interface IPanelProps {
    components?: Partial<IPanelComponents>;
    children?: React.ReactNode;
    labels?: Partial<IPanelLabels>;
    loadingOptions?: IOverlayProviderOptions;
    onDismiss?: () => void;
    onPrimaryButtonClick?: () => void;
}

export const Panel = (props: IPanelProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getPanelStyles(theme), []);
    const components = { ...defaultComponents, ...props.components };
    const labels = { ...PANEL_LABELS, ...props.labels };

    const StableFooter = useCallback(() => {
        return components.Footer ? <components.Footer /> : <></>;
    }, [])

    return (
        <PanelComponentsContext.Provider value={components}>
            <PanelPropsContext.Provider value={props}>
                <PanelLabelsContext.Provider value={labels}>
                    <components.Panel
                        isOpen={true}
                        onDismiss={props.onDismiss}
                        styles={{
                            footer: styles.panelFooter,
                            scrollableContent: styles.panelScrollableContent,
                            content: styles.panelContent,
                        }}
                        //hooks do not work if the component is passed directly
                        //this is so we can get rid of footer if the footer is set to null via props
                        onRenderFooterContent={props.components?.Footer !== null ? StableFooter : undefined}
                        isFooterAtBottom={true}
                    >
                        <components.LoadingOverlayProvider components={{
                            Container: LoadingOverlayProviderContainer,
                            Spinner: LoadingOverlaySpinner
                        }} options={props.loadingOptions}>
                            <components.Header />
                            <components.ScrollableContainer components={{
                                Container: ScrollableContainer
                            }}>
                                {props.children}
                            </components.ScrollableContainer>
                        </components.LoadingOverlayProvider>
                    </components.Panel>
                </PanelLabelsContext.Provider>
            </PanelPropsContext.Provider>
        </PanelComponentsContext.Provider>
    );
}