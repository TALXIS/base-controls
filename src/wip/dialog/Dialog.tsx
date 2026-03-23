import { useMemo } from "react";
import { IDialogComponents } from "./components";
import { components as defaultComponents } from "./components";
import { getDialogStyles } from "./styles";
import { DialogType, ResponsiveMode, useTheme } from "@fluentui/react";
import { DialogComponentsContext } from "./context";
import { IDialogLabels, DIALOG_LABELS } from "./labels";
import { LoadingOverlayContainer } from "./components/loading-overlay-container";
import { Spinner } from "./components/loading-overlay-spinner";
import { ScrollableContainer } from "./components/scrollable-container";

export interface IDialogProps {
    width?: string;
    height?: string;
    components?: Partial<IDialogComponents>;
    labels?: Partial<IDialogLabels>;
    children?: React.ReactNode;
    onPrimaryButtonClick?: () => void;
    onDismiss?: () => void;
}
export const Dialog = (props: IDialogProps) => {
    const components = { ...defaultComponents, ...props.components };
    const { width, height } = props;
    const labels = { ...DIALOG_LABELS, ...props.labels };
    const theme = useTheme();
    const styles = useMemo(() => getDialogStyles({ theme, width, height }), [width, height]);

    return <DialogComponentsContext.Provider value={components}>
        <components.Dialog onDismiss={props.onDismiss} responsiveMode={ResponsiveMode.small} dialogContentProps={{
            type: DialogType.close,
            title: labels.headerText,
            styles: {
                content: styles.content,
                inner: styles.dialogInner,
                innerContent: styles.innerContent,
                title: styles.dialogTitle,
                header: styles.dialogHeader,
                topButton: styles.topButton,
                subText: styles.subtext
            }
        }} modalProps={{
            isBlocking: true,
            styles: {
                scrollableContent: styles.scrollableContent,
                main: styles.dialogMain
            }
        }} hidden={false}>
            <components.LoadingOverlayProvider components={{
                Container: LoadingOverlayContainer,
                Spinner: Spinner
            }}>
                <components.ScrollableContainer components={{
                    Container: ScrollableContainer
                }}>
                    {props.children}
                </components.ScrollableContainer>
                <components.Footer className={styles.footer}>
                    <components.FooterPrimaryButton 
                        text={labels.primaryButtonText}
                        onClick={props.onPrimaryButtonClick} />
                    <components.FooterDismissButton 
                        text={labels.dismissButtonText} 
                        onClick={props.onDismiss} />
                </components.Footer>
            </components.LoadingOverlayProvider>
        </components.Dialog>
    </DialogComponentsContext.Provider>
}