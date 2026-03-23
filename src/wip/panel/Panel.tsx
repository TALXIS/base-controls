import { useTheme } from "@fluentui/react";
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

export interface IPanelProps {
    components?: Partial<IPanelComponents>;
    children?: React.ReactNode;
    labels?: Partial<IPanelLabels>;
    onDismiss?: () => void;
    onPrimaryButtonClick?: () => void;
}

export const Panel = (props: IPanelProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getPanelStyles(theme), []);
    const components = { ...defaultComponents, ...props.components };
    const labels = { ...PANEL_LABELS, ...props.labels };

    const StableFooter = useCallback(() => {
        return <components.Footer />
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
                        onRenderFooterContent={StableFooter}
                        isFooterAtBottom={true}
                    >
                        <components.LoadingOverlayProvider components={{
                            Container: LoadingOverlayProviderContainer,
                            Spinner: LoadingOverlaySpinner
                        }}>
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