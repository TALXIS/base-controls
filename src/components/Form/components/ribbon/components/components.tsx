import { CommandBar, ICommandBarProps } from "@fluentui/react";

export interface IRibbonComponentProps {

}

export interface IRibbonComponents {
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element;
}

export const RibbonComponents: IRibbonComponents = {
    onRenderCommandBar: (props: ICommandBarProps) => <CommandBar {...props} />,
};
