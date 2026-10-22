import { useMemo, useRef } from "react";
import type { ICommandBarItemProps } from "@legacy";
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
    /** Drawn above the selectors. */
    commands?: ICommandBarItemProps[];
    /** The selectors and the column list. */
    children?: React.ReactNode;
    /** Replacements for its slots. */
    components?: Partial<IEditColumnsPanelUiComponents>;
}

/** The column editor's panel, with Save and Cancel under what it holds. */
export const EditColumnsPanel = (props: IEditColumnsPanelUiProps) => {
    const components = { ...EditColumnsPanelUiComponents, ...props.components };
    const styles = useMemo(() => getEditColumnsPanelUiStyles(), []);
    const contentRef = useRef<HTMLDivElement>(null);

    //a panel or dialog opened from the editor sits in a layer of its own
    const onOuterClick = (event?: React.MouseEvent<HTMLDivElement>) => {
        const layer = (event?.target as HTMLElement | undefined)?.closest('.ms-Layer');
        if (!layer || layer.contains(contentRef.current)) {
            props.onDismiss();
        }
    };

    return components.onRenderPanel({
        headerText: props.title,
        isOpen: true,
        //Escape would drop the edit without asking
        onDismiss: event => (event as KeyboardEvent | undefined)?.key === 'Escape' ? event?.preventDefault() : props.onDismiss(),
        onOuterClick,
        onRenderFooterContent: () => components.onRenderFooter({
            saveText: props.saveText,
            cancelText: props.cancelText,
            isSaveDisabled: props.isSaveDisabled,
            onSave: props.onSave,
            onCancel: props.onDismiss,
        }),
        children: <div ref={contentRef} className={styles.content}>
            {components.onRenderCommandBar({ items: props.commands ?? [] })}
            {props.children}
        </div>,
    });
};
