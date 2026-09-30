import { useMemo } from "react";
import { concatStyleSets, ITextProps } from "@fluentui/react";
import { ColumnHeaderUiLabelComponents, IColumnHeaderUiLabelComponents } from "./components";
import { getColumnHeaderUiLabelStyles } from "./styles";

export interface IColumnHeaderUiLabelProps extends ITextProps {
    /** What the column is called. */
    name?: string;
    components?: Partial<IColumnHeaderUiLabelComponents>;
}

/** What a column is called. */
export const ColumnHeaderUiLabel = (props: IColumnHeaderUiLabelProps) => {
    const { name, styles: textStyles, components: _, ...textProps } = props;
    const components = { ...ColumnHeaderUiLabelComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderUiLabelStyles(), []);

    return components.onRenderText({ ...textProps, styles: concatStyleSets({ root: styles.label }, textStyles), children: name });
};
