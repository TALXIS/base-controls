import { ICommand } from "@talxis/client-libraries";
import { IControl } from "../../interfaces/context";
import { ICommandBarProps } from "@talxis/react-components";
import { ITwoOptionsProperty } from "../../interfaces";
import { IShimmerProps, ThemeProviderProps } from "@fluentui/react";

export interface IRibbon extends IControl<IRibbonParameters, any, any, IRibbonComponentProps> {
}

export interface IRibbonParameters {
    Commands: {
        raw: ICommand[];
    }
    Loading: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface IRibbonComponentProps {
    onRender: (props: IComponentProps, defaultRender: (props: IComponentProps) => React.ReactElement) => React.ReactElement;
}

interface IComponentProps {
    container: ThemeProviderProps; 
    onRenderLoading: (props: IShimmerProps, defaultRender: (props: IShimmerProps) => React.ReactElement) => React.ReactElement;
    onRenderCommandBar: (props: ICommandBarProps, defaultRender: (props: ICommandBarProps) => React.ReactElement) => React.ReactElement;
}