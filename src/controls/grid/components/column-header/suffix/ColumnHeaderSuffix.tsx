import { renderAdornments } from "../adornments";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderSuffixComponents, IColumnHeaderSuffixComponents } from "./components";

export interface IColumnHeaderSuffixProps {
    components?: Partial<IColumnHeaderSuffixComponents>;
}

/** What the modules draw after the column's name, and what says the column cannot be changed. */
export const ColumnHeaderSuffix = (props: IColumnHeaderSuffixProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderSuffixComponents, ...props.components };

    return components.onRenderSuffix({
        isEditable: header.isEditable(),
        children: renderAdornments(header.getAdornments('suffix')),
    });
};
