import { ICommandBarProps } from "@legacy";
import { CommandBar as CommandBarBase } from '@legacy';
import * as React from "react";

/** The default ribbon. Replaceable through `ITaskGridComponents.onRenderCommandBar`. */
export const CommandBar = (props: ICommandBarProps) => {
    return <CommandBarBase {...props} />
}