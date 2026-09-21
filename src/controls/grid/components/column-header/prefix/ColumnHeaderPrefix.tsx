import { renderAdornments } from "../adornments";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderPrefixComponents, IColumnHeaderPrefixComponents } from "./components";

export interface IColumnHeaderPrefixProps {
    components?: Partial<IColumnHeaderPrefixComponents>;
}

/** What the modules draw before what names the column. */
export const ColumnHeaderPrefix = (props: IColumnHeaderPrefixProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderPrefixComponents, ...props.components };

    return components.onRenderPrefix({
        alignment: header.getAlignment(),
        children: renderAdornments(header.getAdornments('prefix')),
    });
};
