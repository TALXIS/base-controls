import { useMemo } from "react";
import { IAlignment } from "@utils";
import { getColumnHeaderPrefixStyles } from "./styles";

export interface IColumnHeaderUiPrefixProps {
    /** Which edge the column reads from. */
    alignment?: IAlignment;
    children?: React.ReactNode;
}

/** What a column header draws before what names it. */
export const ColumnHeaderUiPrefix = (props: IColumnHeaderUiPrefixProps) => {
    const { alignment = 'left' } = props;
    const styles = useMemo(() => getColumnHeaderPrefixStyles(alignment), [alignment]);

    return <div className={styles.prefix}>{props.children}</div>;
};
