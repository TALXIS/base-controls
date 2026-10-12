import { useMemo } from "react";
import { EditColumnsPanelUiComponents, IEditColumnsPanelUiComponents } from "./components";
import { getEditColumnsPanelUiStyles } from "./styles";

export interface IEditColumnsPanelUiProps {
    title: string;
    saveText: string;
    cancelText: string;
    isSaveDisabled?: boolean;
    onSave: () => void;
    onDismiss: () => void;
    children?: React.ReactNode;
    components?: Partial<IEditColumnsPanelUiComponents>;
}

/** The column editor's panel, with Save and Cancel under what it holds. */
export const EditColumnsPanel = (props: IEditColumnsPanelUiProps) => {
    const components = { ...EditColumnsPanelUiComponents, ...props.components };
    const styles = useMemo(() => getEditColumnsPanelUiStyles(), []);

    return components.onRenderPanel({
        headerText: props.title,
        isOpen: true,
        //Escape would drop the edit without asking
        onDismiss: event => (event as KeyboardEvent | undefined)?.key === 'Escape' ? event?.preventDefault() : props.onDismiss(),
        onRenderFooterContent: () => components.onRenderFooter({
            saveText: props.saveText,
            cancelText: props.cancelText,
            isSaveDisabled: props.isSaveDisabled,
            onSave: props.onSave,
            onCancel: props.onDismiss,
        }),
        children: <div className={styles.content}>
            {components.onRenderCommandBar({ items: [] })}
            {props.children}
        </div>,
    });
};
