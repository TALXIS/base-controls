import { IButtonProps } from "@fluentui/react";
import { components } from '../../panel/components';
import { useEditColumns } from "../useEditColumns";

export const SaveButton = (props: IButtonProps) => {
    const { model } = useEditColumns();
    return <components.SaveButton {...props} disabled={model.getColumns().length === 0} />
}