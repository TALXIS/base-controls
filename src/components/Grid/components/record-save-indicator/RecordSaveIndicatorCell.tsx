import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { CellRenderer } from "../cells/cell-renderer/CellRenderer";
import { RecordSaveIndicator } from "./RecordSaveIndicator";
import { useRecordSaveStatus } from "./useRecordSaveStatus";

/** The cell of the column a row reports its save in, on a grid with no checkbox column to */
export const RecordSaveIndicatorCell = (props: ICellRendererParams<IRecord>) => {
    //pinned rows have no record, and `cellRendererSelector` renders nothing there
    const record = props.data!;
    const status = useRecordSaveStatus(record);

    return <CellRenderer {...props}>
        {status.hasAnythingToReport && <RecordSaveIndicator record={record} status={status} />}
    </CellRenderer>;
};
