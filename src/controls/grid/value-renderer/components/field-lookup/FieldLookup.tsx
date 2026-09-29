import { useMemo } from "react";
import { getFieldLookupStyles } from "./styles";

export interface IFieldLookupProps {
    children: JSX.Element[];
}

/** What holds a lookup's links, in a row that wraps. */
export const FieldLookup = (props: IFieldLookupProps) => {
    const styles = useMemo(() => getFieldLookupStyles(), []);
    return <div className={styles.lookupRoot}>{props.children}</div>;
};
