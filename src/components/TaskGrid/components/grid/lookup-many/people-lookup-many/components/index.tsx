import { DEFAULT_COMPONENTS, ILookupManyComponents } from "../../components";
import { MultiValueLabel } from "./multi-value-label";
import { Option } from "./option";

export const DEFAULT_PEOPLE_LOOKUP_MANY_COMPONENTS: ILookupManyComponents = {
    ...DEFAULT_COMPONENTS,
    onRenderMultiValueLabel: (props) => <MultiValueLabel {...props} />,
    onRenderOption: (props) => <Option {...props} />
}