import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderLabelComponents, IGridColumnHeaderLabelComponents } from "./components";

export interface IGridColumnHeaderLabelProps {
    components?: Partial<IGridColumnHeaderLabelComponents>;
}

/** What the column is called. */
export const ColumnHeaderLabel = (props: IGridColumnHeaderLabelProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderLabelComponents, ...props.components };

    return components.onRenderLabel({ name: header.getName() });
};
