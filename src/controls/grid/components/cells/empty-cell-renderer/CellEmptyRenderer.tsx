import { CellRenderer, ICellRendererProps } from "../cell-renderer/CellRenderer";

export interface ICellEmptyRendererProps extends ICellRendererProps { }

/** A cell of the grid's own with nothing drawn in it: a column that holds no value. */
export const CellEmptyRenderer = (props: ICellEmptyRendererProps) => {
    return <CellRenderer {...props} components={{ ...props.components, control: { onRenderControl: () => null } }} />;
};
