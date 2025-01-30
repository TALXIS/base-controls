import { IShimmerProps, ISpinnerProps, ThemeProviderProps } from "@fluentui/react";
import { IParameters } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IBinding, IControlStates } from "./NestedControl";

type ControlNameOptions = 'TextField' | 'OptionSet' | 'MultiSelectOptionSet' | 'Lookup' | 'Decimal' | 'Duration' | 'DateTime' | 'GridCellRenderer' | (string & {});

export interface INestedControlRenderer extends IControl<INestedControlRendererParameters, IOutputs, any, INestedControlRendererComponentProps> {
}

export interface INestedControlRendererParameters extends IParameters {
    ControlName: ControlNameOptions
    Bindings: {
        [key: string]: IBinding
    }
    LoadingType?: 'spinner' | 'shimmer'
    ControlStates?: IControlStates;
}

export interface INestedControlRendererComponentProps {
    loadingProps: {
        spinnerProps: ISpinnerProps;
        shimmerProps: IShimmerProps;
        containerProps: React.HTMLAttributes<HTMLDivElement>;

    }
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

    onOverrideControlProps?: (props: IControl<any, any, any, any>) => IControl<any, any, any, any>
    /**
     * Allows you to override the default PCF render. If you return undefined, the default renderer will be used.
     */
    onOverrideRender?: (props: IControl<any, any, any, any>, defaultRender: () => void) => React.ReactElement | void;
}




