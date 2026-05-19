import { DEFAULT_COMPONENTS, ILookupManyComponents } from "../../components";
import { MultiValueContainer } from "./multi-value-container";
import { MultiValueLabel } from "./multi-value-label";
import { Option } from "./option";

export const DEFAULT_TAG_LOOKUP_MANY_COMPONENTS: ILookupManyComponents = {
    ...DEFAULT_COMPONENTS,
    onRenderMultiValueContainer: (props) => <MultiValueContainer {...props} />,
    onRenderMultiValueLabel: (props) => <MultiValueLabel {...props} />,
    onRenderOption: (props) => <Option {...props} />
}
