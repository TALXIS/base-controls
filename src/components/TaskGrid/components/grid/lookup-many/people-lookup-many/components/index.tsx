import { DEFAULT_COMPONENTS, ILookupManyComponents } from "../../components";
import { MultiValueLabel } from "./multi-value-label";

export interface IPeopleLookupManyComponents extends ILookupManyComponents {
    onRenderMultiValueLabel: (props: any) => JSX.Element;
}

export const DEFAULT_PEOPLE_LOOKUP_MANY_COMPONENTS: ILookupManyComponents = {
    ...DEFAULT_COMPONENTS,
    onRenderMultiValueLabel: (props) => <MultiValueLabel {...props} />,
    onRenderSelect: (props) => <DEFAULT_COMPONENTS.onRenderSelect {...props} />
}