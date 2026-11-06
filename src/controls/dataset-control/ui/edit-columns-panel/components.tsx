import { DefaultButton, IPanelProps, PrimaryButton } from "@fluentui/react";
import { CommandBar, ICommandBarProps } from "@legacy";
import { Panel } from "@ui";
import { getDatasetControlUiEditColumnsPanelStyles } from "./styles";

/** Props for the panel's footer. */
export interface IEditColumnsPanelFooterProps {
    /** The save button's text. */
    saveText: string;
    /** The cancel button's text. */
    cancelText: string;
    /** Disables the save button. */
    isSaveDisabled?: boolean;
    /** Called by the save button. */
    onSave: () => void;
    /** Called by the cancel button. */
    onCancel: () => void;
}

/** The replaceable pieces of the column editor's panel. */
export interface IDatasetControlUiEditColumnsPanelComponents {
    /** The panel. */
    onRenderPanel: (props: IPanelProps & { children?: React.ReactNode }) => JSX.Element | null;
    /** The save and cancel buttons. */
    onRenderFooter: (props: IEditColumnsPanelFooterProps) => JSX.Element | null;
    /** Above the selectors; not drawn without items. */
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

const styles = getDatasetControlUiEditColumnsPanelStyles();

/** The defaults for {@link IDatasetControlUiEditColumnsPanelComponents}. */
export const DatasetControlUiEditColumnsPanelComponents: IDatasetControlUiEditColumnsPanelComponents = {
    onRenderPanel: props => <Panel {...props} />,
    onRenderFooter: props => <div className={styles.footer}>
        <PrimaryButton text={props.saveText} disabled={props.isSaveDisabled} onClick={props.onSave} />
        <DefaultButton text={props.cancelText} onClick={props.onCancel} />
    </div>,
    onRenderCommandBar: props => props.items.length || props.farItems?.length ? <CommandBar {...props} /> : null,
};
