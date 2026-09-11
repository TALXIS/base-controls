import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { CellHost } from "../cell-host";
import { RecordSaveIndicator } from "./RecordSaveIndicator";
import { useRecordSaveStatus } from "./useRecordSaveStatus";

/** The cell of the column a row reports its save in, on a grid with no checkbox column to report it in. */
export const RecordSaveIndicatorCell = (props: ICellRendererParams<IRecord>) => {
    //pinned rows have no record, and `cellRendererSelector` renders nothing there
    const record = props.data!;
    const status = useRecordSaveStatus(record);

    return <CellHost {...props}>
        {status.hasAnythingToReport && <RecordSaveIndicator record={record} status={status} />}
    </CellHost>;
};
