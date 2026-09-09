import { useMemo } from "react";
import { getFieldLookupStyles } from "./styles";

export interface IFieldLookupProps {
    children: JSX.Element[];
}

/** What holds a lookup's links. A row that wraps, so a lookup naming several is not clipped to the first. */
export const FieldLookup = (props: IFieldLookupProps) => {
    const styles = useMemo(() => getFieldLookupStyles(), []);
    return <div className={styles.lookupRoot}>{props.children}</div>;
};
