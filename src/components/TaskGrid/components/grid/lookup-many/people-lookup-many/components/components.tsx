import { ILookupManyComponents, LookupManyComponents } from "../../components/components";
import { MultiValueContainer } from "./multi-value-container";
import { MultiValueLabel } from "./multi-value-label";
import { Option } from "./option";

export const DEFAULT_PEOPLE_LOOKUP_MANY_COMPONENTS: ILookupManyComponents = {
    ...LookupManyComponents ,
    onRenderMultiValueLabel: (props) => <MultiValueLabel {...props} />,
    onRenderOption: (props) => <Option {...props} />,
    onRenderMultiValueContainer: (props) => <MultiValueContainer {...props} />
}