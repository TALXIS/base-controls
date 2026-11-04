import { IColumn } from "@talxis/client-libraries";
import { ICommandBarItemProps } from "@legacy";
import { EditColumnsColumn } from "./EditColumnsColumn";

/** A column in the list, with what it offers to do. */
export interface IEditColumnsListColumn {
    /** The column itself. */
    column: IColumn;
    /** What the list shows for it. */
    text: string;
    /** Remove, by default; an override adds its own next to it. */
    commands: ICommandBarItemProps[];
}

/** The replaceable pieces of the column list. */
export interface IEditColumnsColumnListUiComponents {
    /** One draggable column; the default is `EditColumnsColumn`. */
    onRenderColumn: (props: IEditColumnsListColumn) => JSX.Element | null;
}

/** The defaults for {@link IEditColumnsColumnListUiComponents}. */
export const EditColumnsColumnListUiComponents: IEditColumnsColumnListUiComponents = {
    onRenderColumn: props => <EditColumnsColumn {...props} />,
};
