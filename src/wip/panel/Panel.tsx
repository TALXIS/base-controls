import { useTheme } from "@fluentui/react";
import { useMemo } from "react";
import { getPanelStyles } from "./styles";
import { IPanelComponents } from "./components/components";
import { components as defaultComponents } from "./components/components";
import { IPanelFunctions, functions as defaultFunctions } from "./functions/functions";
import { PanelContext } from "./usePanel";

export interface IPanelProps {
    components?: Partial<IPanelComponents>;
    functions?: Partial<IPanelFunctions>;
    children?: React.ReactNode;
}

const LoadingOverlayProviderContainer = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} style={{position: 'unset'}} />
}

export const Panel = (props: IPanelProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getPanelStyles(theme), []);
    const components = { ...defaultComponents, ...props.components };
    const functions = { ...defaultFunctions, ...props.functions };
    const labels = functions.getLabels();
    const { onDismiss, onSave } = functions;

    return (
        <PanelContext.Provider value={{ components: components }}>
            <components.Panel
                isOpen={true}
                headerText={labels.header}
                styles={{
                    footer: styles.panelFooter,
                    scrollableContent: styles.panelScrollableContent,
                    content: styles.panelContent,
                }}
                onRenderFooterContent={() => (
                    <components.FooterContent className={styles.panelFooterButtons}>
                        <components.SaveButton
                            onClick={onSave}
                            text={labels.save}
                        />
                        <components.DismissButton
                            onClick={onDismiss}
                            text={labels.dismiss}
                        />
                    </components.FooterContent>
                )}
                isFooterAtBottom={true}
                onDismiss={onDismiss}
            >
                <components.LoadingOverlayProvider components={{
                    Container: LoadingOverlayProviderContainer
                }}>
                    <components.Header />
                    <components.ScrollableContainer>
                        {props.children}
                    </components.ScrollableContainer>
                </components.LoadingOverlayProvider>
            </components.Panel>
        </PanelContext.Provider>
    );
}