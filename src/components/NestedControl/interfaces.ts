import { IShimmerProps, ISpinnerProps } from "@fluentui/react";
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
    rootContainerProps: React.HTMLAttributes<HTMLDivElement>;
    controlContainerProps: React.HTMLAttributes<HTMLDivElement>;
    onOverrideControlProps: () => ((props: IControl<any, any, any, any>) => IControl<any, any, any, any>) | undefined
}




