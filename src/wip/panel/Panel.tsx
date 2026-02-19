import { IPanelProps as IPanelPropsBase, Panel as BasePanel, PrimaryButton, DefaultButton, useTheme, IButtonProps } from "@fluentui/react";
import { useMemo } from "react";
import { getPanelStyles } from "./styles";

interface IPanelProps extends IPanelPropsBase {
    saveButtonText?: string;
    cancelButtonText?: string;
    onDismiss?: () => void;
    onSave?: () => void;
    components?: {
        FooterContent?: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
        SaveButton?: (props: IButtonProps) => JSX.Element;
        DismissButton?: (props: IButtonProps) => JSX.Element;
    }
}

export const PanelFooterContent = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props}>
        {props.children}
    </div>
}

export const SaveButton = (props: IButtonProps) => {
    return <PrimaryButton {...props} />
}

export const DismissButton = (props: IButtonProps) => {
    return <DefaultButton {...props} />
}

export const Panel = (props: IPanelProps) => {
    const { saveButtonText, cancelButtonText, onDismiss, onSave } = props;
    const theme = useTheme();
    const styles = useMemo(() => getPanelStyles(theme), []);

    const components = {
        FooterContent: PanelFooterContent,
        SaveButton: SaveButton,
        DismissButton: DismissButton,
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
                        onClick={onDismiss}
                        text={cancelButtonText ?? 'Cancel'}
                    />
                </components.FooterContent>
            )
        }}
        isFooterAtBottom
        {...props}
    >
        {props.children}
    </BasePanel>
}