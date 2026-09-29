import { useMemo } from "react";
import { Text } from "@fluentui/react";
import { getFieldTextStyles } from "./styles";

export interface IFieldTextProps {
    text: string | null;
    isMultiline?: boolean;
    /** Whether this is a placeholder for an empty value. */
    isPlaceholder?: boolean;
}

/** A value as text. */
export const FieldText = (props: IFieldTextProps) => {
    const styles = useMemo(
        () => getFieldTextStyles(!!props.isMultiline, !!props.isPlaceholder),
        [props.isMultiline, props.isPlaceholder]);
    //the whole of it on hover, for text the cell had to clip
    return <Text className={styles.text} title={props.text ?? undefined}>{props.text}</Text>;
};
