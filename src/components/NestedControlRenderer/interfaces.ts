import { IButtonProps, IMessageBar, IShimmerProps, ISpinnerProps } from "@fluentui/react";
import { IParameters } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { NestedControl } from "./NestedControl";
import { DataType } from "@talxis/client-libraries";
import { getDefaultNestedControlRendererTranslations } from "./translations";

type ControlNameOptions = 'TextField' | 'OptionSet' | 'MultiSelectOptionSet' | 'Lookup' | 'Decimal' | 'Duration' | 'DateTime' | 'GridCellRenderer' | (string & {});

export interface INestedControlRenderer extends IControl<INestedControlRendererParameters, IOutputs, ReturnType<typeof getDefaultNestedControlRendererTranslations>, INestedControlRendererComponentProps> {
}

export interface INestedControlRendererParameters extends IParameters {
    /**
     * Specifies the name of the control to be rendered. This can be either a custom PCF control or a base control.
     */
    ControlName: ControlNameOptions;

    /**
     * Optional bindings that will be passed to the control. These bindings provide data and metadata to the control.
     */
    Bindings?: {
        [key: string]: IBinding
    };

    /**
     * Specifies the type of loading indicator to display before the control is fully loaded.
     * Options include 'spinner', 'shimmer', or 'none' for no loading indicator.
     */
    LoadingType?: 'spinner' | 'shimmer' | 'none';

    /**
     * Optional configuration to set the control's state, such as enabling or disabling the control.
     */
    ControlStates?: IControlStates;
}

export interface INestedControlRendererComponentProps {
    /**
     * Props for the loading indicator that appears before the control is fully loaded.
     */
    loadingProps: {
        spinnerProps: ISpinnerProps;
        shimmerProps: IShimmerProps;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    };

    /**
     * Props for the message bar that displays error messages.
     */
    messageBarProps: IMessageBar & {
        buttonProps: IButtonProps;
    }

    /**
     * Props for the top-level container that wraps the control and other elements like the loading indicator.
     */
    rootContainerProps: React.HTMLAttributes<HTMLDivElement>;

    /**
     * Props for the container used to render the control.
     */
    controlContainerProps: React.HTMLAttributes<HTMLDivElement>;

    /**
     * Callback function that allows you to override the generated control props.
     */
    onOverrideControlProps: (props: IControl<any, any, any, any>) => IControl<any, any, any, any>;

    /**
     * Callback function that allows you to override the default control render.
     */
    onOverrideRender: (control: NestedControl, isCustomPcfComponent: boolean, defaultRender: () => void) => void;

    /**
     * Callback function that allows you to override the default control unmount behavior.
     */
    onOverrideUnmount: (control: NestedControl, defaultUnmount: () => void) => void;
}

export interface IBinding {
    /**
     * The data type of the binding.
     */
    type: DataType;

    /**
     * Indicates whether the binding is static or bound.
     */
    isStatic: boolean;

    /**
     * The value of the binding.
     */
    value: any;

    /**
     * Formatted value of the binding
     */
    formattedValue?: string | null

    /**
     * Indicates whether the binding has an error.
     */
    error?: boolean;

    /**
     * The error message associated with the binding, if any.
     */
    errorMessage?: string;

    /**
     * Optional metadata for the binding.
     */
    metadata?: {
        /**
         * The entity name associated with the binding.
         */
        entityName?: string;

        /**
         * The logical name of the attribute associated with the binding.
         */
        attributeName?: string;

        /**
         * Callback function to override the metadata for the binding.
         * Always return the spread metadata attribute to ensure proper merging.
         */
        onOverrideMetadata?: (metadata: any) => any
    };

    /**
     * Callback function to notify when the binding's output value changes.
     */
    onNotifyOutputChanged?: (newValue: any) => void;
}

export interface IControlStates {
    /**
     * Indicates whether the control is disabled.
     */
    isControlDisabled?: boolean;
}