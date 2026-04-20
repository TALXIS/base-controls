import * as React from "react";
import { ISkeletonProps } from "./skeleton";
import { Skeleton } from "./skeleton";
import { ICommandBarProps } from "@talxis/react-components";
import { CommandBar } from "./header/command-bar";

export interface ITaskGridComponents {
    onRenderSkeleton: (props: ISkeletonProps) => JSX.Element;
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element;
}

export const TaskGridComponents: ITaskGridComponents = {
    onRenderSkeleton: (props) => <Skeleton {...props} />,
    onRenderCommandBar: (props) => <CommandBar {...props} />
}