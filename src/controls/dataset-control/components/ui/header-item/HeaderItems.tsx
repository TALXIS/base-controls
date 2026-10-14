import { Children, isValidElement, useMemo } from "react";
import { getHeaderItemStyles } from "./styles";

/** Wraps each child in a box of its own, so the header can hide them one by one. */
export const HeaderItems = (props: { children?: React.ReactNode }) => {
    const styles = useMemo(() => getHeaderItemStyles(), []);
    return <>
        {Children.toArray(props.children).map((child, index) => <div key={isValidElement(child) ? child.key : index} className={styles.headerItem}>{child}</div>)}
    </>;
};
