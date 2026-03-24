import { IButtonProps } from "@fluentui/react";
import { FooterPrimaryButton } from "../../../../dialog/components";
import { useViewSwitcherNewQueryDialogContext } from "../../../context";

export const SaveButton = (props: IButtonProps) => {
    const { name } = useViewSwitcherNewQueryDialogContext();
    
    return <FooterPrimaryButton {...props} disabled={!name} />
}