import { useMemo } from "react";
import { EditColumnsButtonUiComponents, IEditColumnsButtonUiComponents } from "./components";
import { getEditColumnsButtonUiStyles } from "./styles";

/** Props for the button that opens the column editor. */
export interface IEditColumnsButtonUiProps {
    /** The button's text. */
    text: string;
    /** Opens the editor. */
    onClick: () => void;
    /** Replacements for its slots. */
    components?: Partial<IEditColumnsButtonUiComponents>;
}

/** The button that opens the column editor. */
export const EditColumnsButton = (props: IEditColumnsButtonUiProps) => {
    const components = { ...EditColumnsButtonUiComponents, ...props.components };
    const styles = useMemo(() => getEditColumnsButtonUiStyles(), []);
    return components.onRenderButton({ className: styles.editColumnsButton, text: props.text, iconProps: { iconName: 'ColumnOptions' }, onClick: props.onClick });
};
