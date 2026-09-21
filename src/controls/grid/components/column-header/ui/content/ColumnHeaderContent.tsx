import { useMemo } from "react";
import { getClassNames, IAlignment } from "@utils";
import { getColumnHeaderContentStyles } from "./styles";

export interface IColumnHeaderContentProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Which edge the column reads from. */
    alignment?: IAlignment;
}

/** What a column header says it is, drawn in: wrap it around the label and what stands with it. */
export const ColumnHeaderContent = (props: IColumnHeaderContentProps) => {
    const { alignment = 'left', className, ...divProps } = props;
    const styles = useMemo(() => getColumnHeaderContentStyles(alignment), [alignment]);

    return <div {...divProps} className={getClassNames([styles.content, className])} />;
};
