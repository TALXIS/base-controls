import { IPanelProps as IPanelPropsBase, Panel as BasePanel, PrimaryButton, DefaultButton, useTheme, IButtonProps, Overlay } from "@fluentui/react";
import { useMemo } from "react";
import { getPanelStyles } from "./styles";
import { Spinner } from "@talxis/react-components";
import { IPanelComponents } from "./components/components";
import { components as defaultComponents } from "./components/components";

export interface IPanelProps extends IPanelPropsBase {
    saveButtonText?: string;
    cancelButtonText?: string;
    isLoading?: boolean;
    components?: Partial<IPanelComponents>;
    onSave?: () => void;
}


export const Panel = (props: IPanelProps) => {
    const { saveButtonText, cancelButtonText, onDismiss, onSave, isLoading } = props;
    const theme = useTheme();
    const styles = useMemo(() => getPanelStyles(theme), []);

    const components = {
        ...defaultComponents,
        ...props.components
    }
    return <BasePanel
        isOpen
        styles={{
            footer: styles.panelFooter,
            scrollableContent: styles.panelScrollableContent,
            content: styles.panelContent,
            ...props.styles
        }}
        onRenderFooterContent={() => {
            return (
                <components.FooterContent className={styles.panelFooterButtons}>
                    <components.SaveButton
                        onClick={onSave}
                        text={saveButtonText ?? 'Save'}
                    />
                    <components.DismissButton
                        onClick={() => onDismiss?.()}
                        text={cancelButtonText ?? 'Cancel'}
                    />
                </components.FooterContent>
            )
        }}
        isFooterAtBottom
        {...props}
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