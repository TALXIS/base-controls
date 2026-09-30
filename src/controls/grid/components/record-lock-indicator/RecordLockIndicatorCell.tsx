import { CellRenderer, ICellRendererProps } from "../cells/cell-renderer/CellRenderer";
import { RecordLockIndicatorCellComponents } from "./components";

export interface IRecordLockIndicatorCellProps extends ICellRendererProps { }

/** The cell a row says in that its record is locked as a whole. */
export const RecordLockIndicatorCell = (props: IRecordLockIndicatorCellProps) => {
    
    const mergedProps: IRecordLockIndicatorCellProps = {
        ...props,
        components: { ...RecordLockIndicatorCellComponents, ...props.components },
    };

    return <CellRenderer {...mergedProps} />;
};
