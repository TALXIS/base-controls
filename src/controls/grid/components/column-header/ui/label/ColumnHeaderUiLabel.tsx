import { useMemo } from "react";
import { ITextProps, Text } from "@fluentui/react";
import { getColumnHeaderLabelStyles } from "./styles";

export interface IColumnHeaderUiLabelProps extends ITextProps {
    /** What the column is called. */
    name?: string;
}

/** What a column is called. */
export const ColumnHeaderUiLabel = (props: IColumnHeaderUiLabelProps) => {
    const { name, styles: textStyles, ...textProps } = props;
    const styles = useMemo(() => getColumnHeaderLabelStyles(), []);

    return <Text {...textProps} styles={{ root: styles.label, ...textStyles }}>{name}</Text>;
};
