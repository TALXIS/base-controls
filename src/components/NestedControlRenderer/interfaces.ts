import { IMessageBar, IShimmerProps, ISpinnerProps, ThemeProviderProps } from "@fluentui/react";
import { IParameters } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IBinding, IControlStates } from "./NestedControl";

type ControlNameOptions = 'TextField' | 'OptionSet' | 'MultiSelectOptionSet' | 'Lookup' | 'Decimal' | 'Duration' | 'DateTime' | 'GridCellRenderer' | (string & {});

export interface INestedControlRenderer extends IControl<INestedControlRendererParameters, IOutputs, any, INestedControlRendererComponentProps> {
}

export interface INestedControlRendererParameters extends IParameters {
    /**
     * Name of the control to be rendered. Can either be a custom PCF or Base Control.
     */
    ControlName: ControlNameOptions
    /**
     * Bindings that will be passed to the control.
     */
    Bindings?: {
        [key: string]: IBinding
    }
    /**
     * Type of loading that will appear before the control is loaded into the page.
     */
    LoadingType?: 'spinner' | 'shimmer' | 'none'
    /**
     * Can be used to set whether the control is disabled or not.
     */
    ControlStates?: IControlStates;
}

export interface INestedControlRendererComponentProps {
    loadingProps: {
        spinnerProps: ISpinnerProps;
        shimmerProps: IShimmerProps;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }
    /**
     * Props for the message bar displaying error message.
     */
    messageBarProps: IMessageBar
    /**
     * Props for top level container. Wraps the control and other elements like loading.
     */
    rootContainerProps: React.HTMLAttributes<HTMLDivElement>;
    /**
     * Props for container used to render the control.
     */
    controlContainerProps: React.HTMLAttributes<HTMLDivElement>;
    /**
     * If you override the control render, additional container is created to create a ThemeProvider so your override is rendered with correct theming applied.
     * You can use this property to assign additional properties to this container.
     */
    overridenControlContainerProps: ThemeProviderProps;

    onOverrideControlProps: (props: IControl<any, any, any, any>) => IControl<any, any, any, any>
    /**
     * Allows you to override the default PCF render.
     */
    onOverrideRender: (props: IControl<any, any, any, any>, defaultRender: () => void) => React.ReactElement | void;
}




