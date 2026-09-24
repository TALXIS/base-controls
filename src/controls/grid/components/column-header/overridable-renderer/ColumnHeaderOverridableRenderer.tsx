import { useGridService } from "../../../useGridService";
import { IColumnHeaderRendererProps } from "../ColumnHeaderRenderer";

export interface IColumnHeaderOverridableRendererProps extends IColumnHeaderRendererProps { }

/** A column's header drawn through `onRenderColumnHeader`. */
//a plain function component, for the reason `ColumnHeaderRenderer` gives
export const ColumnHeaderOverridableRenderer = (props: IColumnHeaderOverridableRendererProps) => {
    const components = useGridService('components');
    return components.onRenderColumnHeader(props);
};
