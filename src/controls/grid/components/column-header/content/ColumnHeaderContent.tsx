import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderUi, IColumnHeaderUiContentComponents } from "../ui";

export interface IColumnHeaderContentProps {
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiContentComponents>;
}

/** What the header says the column is: wrap it around the label and what stands with it. */
export const ColumnHeaderContent = (props: IColumnHeaderContentProps) => {
    const header = useGridColumnHeader();

    return <ColumnHeaderUi.Content alignment={header.getAlignment()} components={props.components}>{props.children}</ColumnHeaderUi.Content>;
};
