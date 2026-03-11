import { IButtonProps } from "@fluentui/react";
import { components } from "../../../../wip/panel/components/components";
import { useEditColumns } from "../useEditColumns";

export const SaveButton = (props: IButtonProps) => {
    const { visibleColumns } = useEditColumns();
    return <components.SaveButton {...props} disabled={visibleColumns.length === 0} />
}