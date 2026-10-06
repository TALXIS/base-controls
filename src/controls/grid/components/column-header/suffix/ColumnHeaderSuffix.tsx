import { renderAdornments } from "../adornments";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderUi, IColumnHeaderUiSuffixComponents } from "../ui";

export interface IColumnHeaderSuffixProps {
    components?: Partial<IColumnHeaderUiSuffixComponents>;
}

/** What the modules draw after the column's name. */
export const ColumnHeaderSuffix = (props: IColumnHeaderSuffixProps) => {
    const header = useGridColumnHeader();

    return <ColumnHeaderUi.Suffix components={props.components}>
        {renderAdornments(header.getAdornments('suffix'))}
    </ColumnHeaderUi.Suffix>;
};
