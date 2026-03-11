import { CommandBar as BaseCommandBar, ICommandBarProps} from "@talxis/react-components";

export const CommandBar = (props: ICommandBarProps) => {
    const {items = [], farItems = []} = props;
    if(items.length === 0 && farItems.length === 0) {
        return <></>
    }
    else {
        return <BaseCommandBar {...props} />
    }
}