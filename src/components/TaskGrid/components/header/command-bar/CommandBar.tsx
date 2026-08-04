import { ICommandBarProps } from "@legacy";
import { CommandBar as CommandBarBase } from '@legacy';
import * as React from "react";

export const CommandBar = (props: ICommandBarProps) => {
    return <CommandBarBase {...props} />
}