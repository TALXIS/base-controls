import { useMemo } from "react";
import { PanelType } from "@fluentui/react";
import { IUserQueriesUiManageViewsPanelComponents, UserQueriesUiManageViewsPanelComponents } from "./components";
import { getUserQueriesUiManageViewsPanelStyles } from "./styles";

/** Props for the panel the user's views are managed in, as plain UI. */
export interface IUserQueriesUiManageViewsPanelProps {
    title: string;
    closeText: string;
    /** What lists the views. */
    children?: React.ReactNode;
    /** Called by the close button and on closing the panel. */
    onDismiss: () => void;
    /** Replacements for its slots. */
    components?: Partial<IUserQueriesUiManageViewsPanelComponents>;
}

/** A panel holding the list of the user's views, with Close in its footer. */
export const UserQueriesUiManageViewsPanel = (props: IUserQueriesUiManageViewsPanelProps) => {
    const components = { ...UserQueriesUiManageViewsPanelComponents, ...props.components };
    const styles = useMemo(() => getUserQueriesUiManageViewsPanelStyles(), []);

    return components.onRender({
        isOpen: true,
        type: PanelType.medium,
        headerText: props.title,
        styles: { content: styles.content },
        onDismiss: props.onDismiss,
        onRenderFooterContent: () => components.onRenderCloseButton({ text: props.closeText, onClick: props.onDismiss }),
        children: props.children,
    });
};
