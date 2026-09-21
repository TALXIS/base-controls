import { renderAdornments } from "../adornments";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderPrefixComponents, IGridColumnHeaderPrefixComponents } from "./components";

export interface IGridColumnHeaderPrefixProps {
    components?: Partial<IGridColumnHeaderPrefixComponents>;
}

/** What the modules draw before what names the column. */
export const ColumnHeaderPrefix = (props: IGridColumnHeaderPrefixProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderPrefixComponents, ...props.components };

    return components.onRenderPrefix({
        alignment: header.getAlignment(),
        children: renderAdornments(header.getAdornments('prefix')),
    });
};
