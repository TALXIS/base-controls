import { IControlProps } from "./Control";
import { ControlRenderer } from "./control-renderer";

export interface IControlComponents {
    onRenderControl: (props: IControlProps) => React.ReactNode;
}

export const ControlComponents: IControlComponents = {
    onRenderControl: (props: IControlProps) => <ControlRenderer {...props} />
}