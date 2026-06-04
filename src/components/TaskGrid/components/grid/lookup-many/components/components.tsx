import { MenuProps, MultiValueGenericProps, OptionProps, Props, components } from "react-select";
import AsyncSelect from "react-select/async";
import { MultiValueLabel } from "./multi-value-label";
import { MultiValueContainer } from "./multi-value-container";
import { Menu } from "./menu";

export interface ILookupManyComponents {
    onRenderMultiValueContainer: (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => JSX.Element;
    onRenderMultiValueLabel: (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => JSX.Element;
    onRenderSelect: (selectProps: Props<ComponentFramework.EntityReference, boolean, any>) => JSX.Element;
    onRenderOption: (props: OptionProps<ComponentFramework.EntityReference, boolean, any>) => JSX.Element;
    onRenderMenu: (props: MenuProps<ComponentFramework.EntityReference, boolean, any>) => JSX.Element;
}

export const LookupManyComponents: ILookupManyComponents = {
    onRenderSelect: (selectProps) => <AsyncSelect {...selectProps} />,
    onRenderMultiValueContainer: (props) => <MultiValueContainer {...props} />,
    onRenderMultiValueLabel: (props) => <MultiValueLabel {...props} />,
    onRenderOption: (props) => <components.Option {...props} />,
    onRenderMenu: (props) => <Menu {...props} />
}