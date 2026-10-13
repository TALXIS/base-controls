import { useMemo } from "react";
import { EditColumnsPanelUiComponents, IEditColumnsPanelUiComponents } from "./components";
import { getEditColumnsPanelUiStyles } from "./styles";

/** Props for the panel the column editor sits in, as plain UI. */
export interface IEditColumnsPanelUiProps {
    /** The panel's header. */
    title: string;
    /** The save button's text. */
    saveText: string;
    /** The cancel button's text. */
    cancelText: string;
    /** Disables the save button. */
    isSaveDisabled?: boolean;
    /** Called by the save button. */
    onSave: () => void;
    /** Called by the cancel button and on closing the panel. */
    onDismiss: () => void;
    /** The selectors and the column list. */
    children?: React.ReactNode;
    /** Replacements for its slots. */
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
