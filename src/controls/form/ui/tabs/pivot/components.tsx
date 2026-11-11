import { IPivotProps, Pivot } from "@fluentui/react";

export interface IFormUiPivotComponents {
    onRender: (props: IPivotProps) => JSX.Element;
}

export const FormUiPivotComponents: IFormUiPivotComponents = {
    onRender: (props) => <Pivot {...props} />
}
