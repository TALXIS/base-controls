import { IPivotProps, Pivot } from "@fluentui/react";

export interface IPivotComponents {
    onRenderPivot: (props: IPivotProps) => JSX.Element;
}

export const PivotComponents: IPivotComponents = {
    onRenderPivot: (props) => <Pivot {...props} />
}
