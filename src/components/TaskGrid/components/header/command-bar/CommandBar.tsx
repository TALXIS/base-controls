import { ICommandBarProps } from "../../../../../legacy/react-components";
import { CommandBar as CommandBarBase } from '../../../../../legacy/react-components';
import * as React from "react";

export const CommandBar = (props: ICommandBarProps) => {
    return <CommandBarBase {...props} />
}