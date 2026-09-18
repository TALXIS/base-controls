import { ILookupManyComponents, LookupManyComponents } from "@components/TaskGrid/modules/lookup-many/components/components/components";
import { MultiValueContainer } from "./multi-value-container";
import { MultiValueLabel } from "./multi-value-label";
import { Option } from "./option";

/** The persona slot overrides for {@link PeopleLookupMany}. */
export const DEFAULT_PEOPLE_LOOKUP_MANY_COMPONENTS: ILookupManyComponents = {
    ...LookupManyComponents ,
    onRenderMultiValueLabel: (props) => <MultiValueLabel {...props} />,
    onRenderOption: (props) => <Option {...props} />,
    onRenderMultiValueContainer: (props) => <MultiValueContainer {...props} />
}