import { IRecord } from "@talxis/client-libraries";
import { IColumn } from "@talxis/client-libraries";

export interface ICellNotificationsProps {
    record: IRecord;
    column: IColumn;
}

/** What a cell has to say about its field. A stub: it draws nothing yet. */
export const Notifications = (_props: ICellNotificationsProps) => null;
