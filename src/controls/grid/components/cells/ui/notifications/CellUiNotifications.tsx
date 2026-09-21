import { IRecord } from "@talxis/client-libraries";
import { IColumn } from "@talxis/client-libraries";

export interface ICellUiNotificationsProps {
    record: IRecord;
    column: IColumn;
}

/** What a cell has to say about its field. */
export const CellUiNotifications = (_props: ICellUiNotificationsProps) => null;
