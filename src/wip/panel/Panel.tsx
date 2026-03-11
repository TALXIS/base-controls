import { IPanelProps as IPanelPropsBase, Panel as BasePanel, useTheme, Overlay } from "@fluentui/react";
import { useMemo } from "react";
import { getPanelStyles } from "./styles";
import { Spinner } from "@talxis/react-components";
import { IPanelComponents } from "./components/components";
import { components as defaultComponents } from "./components/components";
import { IPanelFunctions, functions as defaultFunctions } from "./functions/functions";

export interface IPanelProps {
    isLoading?: boolean;
    components?: Partial<IPanelComponents>;
    functions?: Partial<IPanelFunctions>;
    children?: React.ReactNode;
    /**
     * Can be used to override props that are passed to Fluent UI's Panel component. This is useful for cases where the consumer needs to set props that are not explicitly handled by this Panel component, such as `isBlocking`. The function receives the default props as an argument and should return the modified props.
     */
    overrideComponentProps?: (props: IPanelPropsBase) => IPanelPropsBase;
}

export const Panel = (props: IPanelProps) => {
    const { isLoading } = props;
    const theme = useTheme();
    const styles = useMemo(() => getPanelStyles(theme), []);
    const components = { ...defaultComponents, ...props.components };
    const functions = { ...defaultFunctions, ...props.functions };
    const labels = functions.getLabels();
    const getPanelProps = (props.overrideComponentProps ?? ((p: IPanelPropsBase) => p));


    return <BasePanel
        {...getPanelProps({
            isOpen: true,
            headerText: labels.header,
            styles: {
                footer: styles.panelFooter,
                scrollableContent: styles.panelScrollableContent,
                content: styles.panelContent,
            },
            onRenderFooterContent: () => (
                <components.FooterContent className={styles.panelFooterButtons}>
                    <components.SaveButton
                        onClick={functions.onSave}
                        text={labels.save}
                    />
                    <components.DismissButton
                        onClick={functions.onDismiss}
                        text={labels.dismiss}
                    />
                </components.FooterContent>
            ),
            isFooterAtBottom: true,
            onDismiss: functions.onDismiss
        })}
    >
        <components.Header />
        <components.ScrollableContainer>
            {isLoading && <Overlay className={styles.loadingOverlay}>
                <Spinner />
            </Overlay>}
            {props.children}
        </components.ScrollableContainer>
    </BasePanel>
}