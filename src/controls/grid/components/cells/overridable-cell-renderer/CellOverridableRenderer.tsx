import { useGridService } from "../../../useGridService";
import { ICellRendererProps } from "../cell-renderer/CellRenderer";

export interface ICellOverridableRendererProps extends ICellRendererProps { }

/** A cell drawn through `onRenderCellRenderer`. */
export const CellOverridableRenderer = (props: ICellOverridableRendererProps) => {
    const components = useGridService('components');
    return components.onRenderCellRenderer(props);
};
