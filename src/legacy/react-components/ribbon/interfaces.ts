import { ICommand } from "@talxis/client-libraries";
import { IControl } from "@interfaces/context";
import { ICommandBarProps } from "@legacy";
import { ITwoOptionsProperty } from "@interfaces";
import { IShimmerProps } from "@fluentui/react";
import { IThemeProviderProps } from "@utils";

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
    /** What the control is drawn in, and what it paints its own element with. */
    container: IThemeProviderProps;
    isLoading: boolean; 
    onRenderLoading: (props: IShimmerProps, defaultRender: (props: IShimmerProps) => React.ReactElement) => React.ReactElement;
    onRenderCommandBar: (props: ICommandBarProps, defaultRender: (props: ICommandBarProps) => React.ReactElement) => React.ReactElement;
}