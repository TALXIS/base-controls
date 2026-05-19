import { DEFAULT_COMPONENTS, ILookupManyComponents } from "../../components";
import { MultiValueContainer } from "./multi-value-container";
import { Option } from "./option";

export const DEFAULT_TAG_LOOKUP_MANY_COMPONENTS: ILookupManyComponents = {
    ...DEFAULT_COMPONENTS,
    onRenderMultiValueContainer: (props) => <MultiValueContainer {...props} />,
    onRenderOption: (props) => <Option {...props} />
}
