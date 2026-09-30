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
    const locks = useGridService('locks');
    const labels = useGridService('labels');

    return <ColumnHeaderUi.Suffix
        //a grid with editing off marks no column
        isLocked={locks.get({ columnName: header.getColDef().colId }).lockedBy === 'column'}
        lockMessage={labels.getLocalizedString('columnLocked')}
        components={props.components}>
        {renderAdornments(header.getAdornments('suffix'))}
    </ColumnHeaderUi.Suffix>;
};
