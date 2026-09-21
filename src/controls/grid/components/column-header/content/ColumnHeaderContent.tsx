import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderContentComponents, IColumnHeaderContentComponents } from "./components";

export interface IColumnHeaderContentProps {
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderContentComponents>;
}

/** What the header says the column is: wrap it around the label and what stands with it. */
export const ColumnHeaderContent = (props: IColumnHeaderContentProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderContentComponents, ...props.components };

    return components.onRenderContent({ alignment: header.getAlignment(), children: props.children });
};
