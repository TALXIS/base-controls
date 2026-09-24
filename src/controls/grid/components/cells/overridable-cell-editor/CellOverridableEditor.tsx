import { useGridService } from "../../../useGridService";
import { ICellEditorProps } from "../cell-editor/CellEditor";

export interface ICellOverridableEditorProps extends ICellEditorProps { }

/** A cell being edited, drawn through `onRenderCellEditor`. */
export const CellOverridableEditor = (props: ICellOverridableEditorProps) => {
    const components = useGridService('components');
    return components.onRenderCellEditor(props);
};
