import { ICommandBarItemProps } from "@fluentui/react";
import { CommandBar as BaseCommandBar, ICommandBarProps as ICommandBarPropsBase} from "@fluentui/react";

export interface ICommandBarProps extends Omit<ICommandBarPropsBase, 'items'> {
    items?: ICommandBarItemProps[];
}

export const CommandBar = (props: ICommandBarProps) => {
    const {items = [], farItems = []} = props;
    if(items.length === 0 && farItems.length === 0) {
        return <></>
    }
    else {
        return <BaseCommandBar {...props} items={items} />
    }
}