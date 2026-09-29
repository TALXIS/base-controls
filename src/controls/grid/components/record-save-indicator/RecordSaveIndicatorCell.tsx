import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { CellRenderer } from "../cells/cell-renderer/CellRenderer";
import { RecordSaveIndicator } from "./RecordSaveIndicator";
import { useRecordSaveStatus } from "./useRecordSaveStatus";

/** The cell a row reports its save in, on a grid with no checkbox column. */
export const RecordSaveIndicatorCell = (props: ICellRendererParams<IRecord>) => {
    //`cellRendererSelector` skips pinned rows: they have no save to report
    const record = props.data!;
    const status = useRecordSaveStatus(record);

    return <CellRenderer {...props} components={{
        control: {
            onRenderControl: () => status.hasAnythingToReport ? <RecordSaveIndicator record={record} status={status} /> : null
        }
    }} />;
};
