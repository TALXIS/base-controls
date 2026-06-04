import { LookupManyComponents, ILookupManyComponents } from "../../components/components";
import { MultiValueContainer } from "./multi-value-container";
import { Option } from "./option";

export const DEFAULT_TAG_LOOKUP_MANY_COMPONENTS: ILookupManyComponents = {
    ...LookupManyComponents,
    onRenderMultiValueContainer: (props) => <MultiValueContainer {...props} />,
    onRenderOption: (props) => <Option {...props} />
}
