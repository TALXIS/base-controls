import { IRecord } from "@talxis/client-libraries";
import { IGridColumn } from "../../../grid/columns";

export interface ICellNotificationsProps {
    record: IRecord;
    column: IGridColumn;
}

/** What a cell has to say about its field. A stub: it draws nothing yet. */
export const Notifications = (_props: ICellNotificationsProps) => null;
