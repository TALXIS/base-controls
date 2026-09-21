import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderLabelComponents, IColumnHeaderLabelComponents } from "./components";

export interface IColumnHeaderLabelProps {
    components?: Partial<IColumnHeaderLabelComponents>;
}

/** What the column is called. */
export const ColumnHeaderLabel = (props: IColumnHeaderLabelProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderLabelComponents, ...props.components };

    return components.onRenderLabel({ name: header.getName() });
};
