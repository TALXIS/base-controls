import { IButtonProps } from "@fluentui/react";
import { components } from '../../../panel/components';
import { useEditColumns } from "../../context";

export const SaveButton = (props: IButtonProps) => {
    const model = useEditColumns();
    return <components.FooterPrimaryButton {...props} disabled={model.getColumns().length === 0} />
}