import { CellRenderer, ICellRendererProps } from "../../../../components/cells/cell-renderer/CellRenderer";

/** What a column the rows are grouped by draws in its cells. */
export const GroupCell = (props: ICellRendererProps) => {
    return <CellRenderer {...props} components={{ ...props.components, control: { onRenderControl: () => <>dummy</> } }} />;
};
