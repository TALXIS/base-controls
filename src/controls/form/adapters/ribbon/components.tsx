import { CommandBar, ICommandBarProps } from "@fluentui/react";

export interface IRibbonComponents {
    onRender: (props: ICommandBarProps) => JSX.Element;
}

export const RibbonComponents: IRibbonComponents = {
    onRender: (props: ICommandBarProps) => <CommandBar {...props} />,
};
