import { Column, useTabContext } from "../../../../../components";
import type { IColumn } from "../../../Form";

export const XrmColumn = ({column}: {column: IColumn}) => {
    const tabContext = useTabContext();
    console.log("tabContext", tabContext);
    return <Column >
        column
    </Column>
}