import { IOptionProps } from "../OptionSetRenderer";
import { Option } from "./option";

/** The replaceable pieces of an option set. Override through `IOptionSetRendererProps.components`. */
export interface IOptionSetRendererComponents {
    /** One option. */
    onRenderOption: (props: IOptionProps) => JSX.Element;
}

/** The defaults for {@link IOptionSetRendererComponents}. */
export const OptionSetRendererComponents: IOptionSetRendererComponents = {
    onRenderOption: props => <Option {...props} />,
};
