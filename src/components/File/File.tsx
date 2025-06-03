import { useControl } from "../../hooks";
import { IFile } from "./interfaces";

export const File = (props: IFile) => {
    const {sizing, theme, onNotifyOutputChanged}  = useControl('File', props, {});
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);


}