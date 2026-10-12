import { DefaultButton, IPanelProps, PrimaryButton } from "@fluentui/react";
import { CommandBar, ICommandBarProps } from "@legacy";
import { Panel } from "@ui";
import { getEditColumnsPanelUiStyles } from "./styles";

export interface IEditColumnsPanelFooterProps {
    saveText: string;
    cancelText: string;
    isSaveDisabled?: boolean;
    onSave: () => void;
    onCancel: () => void;
}

/** The replaceable pieces of the column editor's panel. */
export interface IEditColumnsPanelUiComponents {
    onRenderPanel: (props: IPanelProps & { children?: React.ReactNode }) => JSX.Element | null;
    onRenderFooter: (props: IEditColumnsPanelFooterProps) => JSX.Element | null;
    /** Above the selectors; empty, and so not drawn, unless an override adds items. */
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

const styles = getEditColumnsPanelUiStyles();

/** The defaults for {@link IEditColumnsPanelUiComponents}. */
export const EditColumnsPanelUiComponents: IEditColumnsPanelUiComponents = {
    onRenderPanel: props => <Panel {...props} />,
    onRenderFooter: props => <div className={styles.footer}>
        <PrimaryButton text={props.saveText} disabled={props.isSaveDisabled} onClick={props.onSave} />
        <DefaultButton text={props.cancelText} onClick={props.onCancel} />
    </div>,
    onRenderCommandBar: props => props.items.length || props.farItems?.length ? <CommandBar {...props} /> : null,
};
