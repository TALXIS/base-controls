import { useGridService } from "../../../useGridService";
import { ICellEmptyRendererProps } from "../empty-cell-renderer/CellEmptyRenderer";

export interface ICellOverridableEmptyRendererProps extends ICellEmptyRendererProps { }

/** An empty cell drawn through `onRenderEmptyCellRenderer`. */
export const CellOverridableEmptyRenderer = (props: ICellOverridableEmptyRendererProps) => {
    const components = useGridService('components');
    return components.onRenderEmptyCellRenderer(props);
};
