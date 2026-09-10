import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { RecordSaveIndicator } from "./RecordSaveIndicator";
import { useRecordSaveStatus } from "./useRecordSaveStatus";

interface IRecordSaveIndicatorCellProps extends ICellRendererParams {
    record: IRecord;
}

/** The cell of the column a row reports its save in, on a grid with no checkbox column to report it in. */
export const RecordSaveIndicatorCell = (props: IRecordSaveIndicatorCellProps) => {
    const { record } = props;
    const status = useRecordSaveStatus(record);

    if (!status.hasAnythingToReport) {
        return <></>;
    }
    return <RecordSaveIndicator record={record} status={status} />;
};
