import { useGridService } from "../../../useGridService";
import { renderAdornments } from "../adornments";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderSuffixComponents, IColumnHeaderSuffixComponents } from "./components";

export interface IColumnHeaderSuffixProps {
    components?: Partial<IColumnHeaderSuffixComponents>;
}

/** What the modules draw after the column's name, and what says the column cannot be changed. */
export const ColumnHeaderSuffix = (props: IColumnHeaderSuffixProps) => {
    const header = useGridColumnHeader();
    const settings = useGridService('settings');
    const components = { ...ColumnHeaderSuffixComponents, ...props.components };

    return components.onRenderSuffix({
        //a read-only column is only worth marking in a grid that can be edited
        isEditable: !settings.isEditingEnabled() || header.isEditable(),
        children: renderAdornments(header.getAdornments('suffix')),
    });
};
