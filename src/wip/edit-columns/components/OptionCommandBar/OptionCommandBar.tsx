import { CommandBar } from "../CommandBar/CommandBar";
import { IOptionCommandBarProps } from "../components";

export const OptionCommandBar = (props: IOptionCommandBarProps) => {
    const { context, ...rest } = props;
    return <CommandBar {...rest} />
}