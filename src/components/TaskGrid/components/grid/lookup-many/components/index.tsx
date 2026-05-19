import { MultiValueGenericProps, OptionProps, Props, components } from "react-select";
import AsyncSelect from "react-select/async";
import { MultiValueLabel } from "./multi-value-label";

export interface ILookupManyComponents {
    onRenderMultiValueLabel: (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => JSX.Element;
    onRenderSelect: (selectProps: Props<ComponentFramework.EntityReference, boolean, any>) => JSX.Element;
    onRenderOption: (props: OptionProps<ComponentFramework.EntityReference, boolean, any>) => JSX.Element;
}

export const DEFAULT_COMPONENTS: ILookupManyComponents = {
    onRenderSelect: (selectProps) => <AsyncSelect {...selectProps} />,
    onRenderMultiValueLabel: (props) => <MultiValueLabel {...props} />,
    onRenderOption: (props) => <components.Option {...props} />
}