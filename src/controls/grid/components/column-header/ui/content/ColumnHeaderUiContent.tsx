import { useMemo } from "react";
import { getClassNames, IAlignment } from "@utils";
import { ColumnHeaderUiContentComponents, IColumnHeaderUiContentComponents } from "./components";
import { getColumnHeaderUiContentStyles } from "./styles";

export interface IColumnHeaderUiContentProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Which edge the column reads from. */
    alignment?: IAlignment;
    components?: Partial<IColumnHeaderUiContentComponents>;
}

/** What a column header says it is, drawn in: wrap it around the label and what stands with it. */
export const ColumnHeaderUiContent = (props: IColumnHeaderUiContentProps) => {
    const { alignment = 'left', className, components: _, ...divProps } = props;
    const components = { ...ColumnHeaderUiContentComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderUiContentStyles(alignment), [alignment]);

    return components.onRenderContainer({ ...divProps, className: getClassNames([styles.content, className]) });
};
