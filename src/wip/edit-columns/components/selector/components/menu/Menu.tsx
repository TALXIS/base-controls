import { Callout, DirectionalHint, IColumn } from "@fluentui/react"
import { components, GroupBase, MenuProps } from "react-select"

export interface IMenuProps {
    selectorId: string;
    menuProps: MenuProps<IColumn, any, GroupBase<IColumn>>
}

export const Menu = (props: IMenuProps) => {
    const { selectorId, menuProps } = props;
    return (
        <Callout
            directionalHint={DirectionalHint.leftTopEdge}
            target={`#${selectorId}`}>
            <components.Menu {...menuProps} />
        </Callout>
    )
}