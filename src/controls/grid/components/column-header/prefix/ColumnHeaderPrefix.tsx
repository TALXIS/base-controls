import { renderAdornments } from "../adornments";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderUi, IColumnHeaderUiPrefixComponents } from "../ui";

export interface IColumnHeaderPrefixProps {
    components?: Partial<IColumnHeaderUiPrefixComponents>;
}

/** What the modules draw before what names the column. */
export const ColumnHeaderPrefix = (props: IColumnHeaderPrefixProps) => {
    const header = useGridColumnHeader();

    return <ColumnHeaderUi.Prefix alignment={header.getAlignment()} components={props.components}>
        {renderAdornments(header.getAdornments('prefix'))}
    </ColumnHeaderUi.Prefix>;
};
