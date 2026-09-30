import { useGridService } from "../../../useGridService";
import { renderAdornments } from "../adornments";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderUi, IColumnHeaderUiSuffixComponents } from "../ui";

export interface IColumnHeaderSuffixProps {
    components?: Partial<IColumnHeaderUiSuffixComponents>;
}

/** What the modules draw after the column's name, and what says the column cannot be changed. */
export const ColumnHeaderSuffix = (props: IColumnHeaderSuffixProps) => {
    const header = useGridColumnHeader();
    const editability = useGridService('editability');
    const labels = useGridService('labels');

    return <ColumnHeaderUi.Suffix
        //a grid that cannot be edited at all marks no column
        isEditable={editability.get({ columnName: header.getColDef().colId }).lockedBy !== 'column'}
        lockMessage={labels.getLocalizedString('columnNotEditable')}
        components={props.components}>
        {renderAdornments(header.getAdornments('suffix'))}
    </ColumnHeaderUi.Suffix>;
};
