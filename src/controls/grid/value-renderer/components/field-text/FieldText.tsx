import { useMemo } from "react";
import { useLineClamp } from "../../useLineClamp";
import { getFieldTextStyles } from "./styles";

export interface IFieldTextProps {
    text: string | null;
    isMultiline?: boolean;
    /** Whether this is a placeholder for an empty value. */
    isPlaceholder?: boolean;
}

/** A value as text. */
export const FieldText = (props: IFieldTextProps) => {
    const { ref, lines } = useLineClamp(!!props.isMultiline);
    const styles = useMemo(
        () => getFieldTextStyles(!!props.isMultiline, !!props.isPlaceholder, lines),
        [props.isMultiline, props.isPlaceholder, lines]);
    //the whole of it on hover, for text the cell had to clip
    return <span ref={ref} className={styles.text} title={props.text ?? undefined}>{props.text}</span>;
};
