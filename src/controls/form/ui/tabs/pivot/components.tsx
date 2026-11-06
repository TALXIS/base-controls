import { IPivotProps, Pivot } from "@fluentui/react";

export interface IFormUiPivotComponents {
    onRenderPivot: (props: IPivotProps) => JSX.Element;
}

export const FormUiPivotComponents: IFormUiPivotComponents = {
    onRenderPivot: (props) => <Pivot {...props} />
}
