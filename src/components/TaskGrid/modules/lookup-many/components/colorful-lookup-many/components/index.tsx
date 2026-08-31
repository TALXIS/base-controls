import { LookupManyComponents, ILookupManyComponents } from "@components/TaskGrid/modules/lookup-many/components/components/components";
import { MultiValueContainer } from "./multi-value-container";
import { Option } from "./option";

/** The coloured-tag slot overrides for {@link ColorfulLookupMany}. */
export const DEFAULT_TAG_LOOKUP_MANY_COMPONENTS: ILookupManyComponents = {
    ...LookupManyComponents,
    onRenderMultiValueContainer: (props) => <MultiValueContainer {...props} />,
    onRenderOption: (props) => <Option {...props} />
}
