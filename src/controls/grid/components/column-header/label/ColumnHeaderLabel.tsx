import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderUi, IColumnHeaderUiLabelComponents } from "../ui";

export interface IColumnHeaderLabelProps {
    components?: Partial<IColumnHeaderUiLabelComponents>;
}

/** What the column is called. */
export const ColumnHeaderLabel = (props: IColumnHeaderLabelProps) => {
    const header = useGridColumnHeader();

    return <ColumnHeaderUi.Label name={header.getName()} components={props.components} />;
};
