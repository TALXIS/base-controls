import { useMemo } from "react";
import { IAlignment } from "@utils";
import { getColumnHeaderPrefixStyles } from "./styles";

export interface IColumnHeaderPrefixProps {
    /** Which edge the column reads from. */
    alignment?: IAlignment;
    children?: React.ReactNode;
}

/** What a column header draws before what names it. */
export const ColumnHeaderPrefix = (props: IColumnHeaderPrefixProps) => {
    const { alignment = 'left' } = props;
    const styles = useMemo(() => getColumnHeaderPrefixStyles(alignment), [alignment]);

    return <div className={styles.prefix}>{props.children}</div>;
};
