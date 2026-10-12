import { useMemo } from "react";
import { EditColumnsButtonUiComponents, IEditColumnsButtonUiComponents } from "./components";
import { getEditColumnsButtonUiStyles } from "./styles";

export interface IEditColumnsButtonUiProps {
    text: string;
    onClick: () => void;
    components?: Partial<IEditColumnsButtonUiComponents>;
}

/** The button that opens the column editor. */
export const EditColumnsButton = (props: IEditColumnsButtonUiProps) => {
    const components = { ...EditColumnsButtonUiComponents, ...props.components };
    const styles = useMemo(() => getEditColumnsButtonUiStyles(), []);
    return components.onRenderButton({ className: styles.editColumnsButton, text: props.text, iconProps: { iconName: 'ColumnOptions' }, onClick: props.onClick });
};
