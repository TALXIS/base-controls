import { renderAdornments } from "../adornments";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderSuffixComponents, IGridColumnHeaderSuffixComponents } from "./components";

export interface IGridColumnHeaderSuffixProps {
    components?: Partial<IGridColumnHeaderSuffixComponents>;
}

/** What the modules draw after the column's name, and what says the column cannot be changed. */
export const ColumnHeaderSuffix = (props: IGridColumnHeaderSuffixProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderSuffixComponents, ...props.components };

    return components.onRenderSuffix({
        isEditable: header.isEditable(),
        children: renderAdornments(header.getAdornments('suffix')),
    });
};
