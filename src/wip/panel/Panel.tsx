import { useTheme } from "@fluentui/react";
import { useMemo } from "react";
import { getPanelStyles } from "./styles";
import { IPanelComponents } from "./components/components";
import { components as defaultComponents } from "./components/components";
import { PanelComponentsContext } from "./context";
import { LoadingOverlayProviderContainer } from "./components/loading-overlay-provider-container";
import { LoadingOverlaySpinner } from "./components/loading-overlay-spinner/LoadingOverlaySpinner";
import { IPanelLabels } from "./labels";
import { PANEL_LABELS } from "./labels";

export interface IPanelProps {
    components?: Partial<IPanelComponents>;
    children?: React.ReactNode;
    labels?: Partial<IPanelLabels>
}

export const Panel = (props: IPanelProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getPanelStyles(theme), []);
    const components = { ...defaultComponents, ...props.components };
    const labels = { ...PANEL_LABELS, ...props.labels };

    return (
        <PanelComponentsContext.Provider value={components}>
            <components.Panel
                isOpen={true}
                styles={{
                    footer: styles.panelFooter,
                    scrollableContent: styles.panelScrollableContent,
                    content: styles.panelContent,
                }}
                onRenderFooterContent={() => (
                    <components.FooterContent className={styles.panelFooterButtons}>
                        <components.SaveButton
                            text={labels.save}
                        />
                        <components.DismissButton
                            text={labels.dismiss}
                        />
                    </components.FooterContent>
                )}
                isFooterAtBottom={true}
            >
                <components.LoadingOverlayProvider components={{
                    Container: LoadingOverlayProviderContainer,
                    Spinner: LoadingOverlaySpinner
                }}>
                    <components.Header />
                    <components.ScrollableContainer>
                        {props.children}
                    </components.ScrollableContainer>
                </components.LoadingOverlayProvider>
            </components.Panel>
        </PanelComponentsContext.Provider>
    );
}