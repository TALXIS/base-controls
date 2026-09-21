import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderContentComponents, IGridColumnHeaderContentComponents } from "./components";

export interface IGridColumnHeaderContentProps {
    children?: React.ReactNode;
    components?: Partial<IGridColumnHeaderContentComponents>;
}

/** What the header says the column is: wrap it around the label and what stands with it. */
export const ColumnHeaderContent = (props: IGridColumnHeaderContentProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderContentComponents, ...props.components };

    return components.onRenderContent({ alignment: header.getAlignment(), children: props.children });
};
