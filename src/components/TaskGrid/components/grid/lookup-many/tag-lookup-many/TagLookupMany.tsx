import { ILookupManyProps, LookupMany } from "../LookupMany";
import { DEFAULT_TAG_LOOKUP_MANY_COMPONENTS } from "./components";
import { TagLookupManyPropsContext } from "./context";

export interface ITagLookupManyProps extends ILookupManyProps {
    colorPropertyName?: string;
}

export const TagLookupMany = (props: ITagLookupManyProps) => {
    const components = { ...DEFAULT_TAG_LOOKUP_MANY_COMPONENTS, ...props.components };
    return <TagLookupManyPropsContext.Provider value={props}>
        <LookupMany
            {...props}
            components={components}
        />
    </TagLookupManyPropsContext.Provider>
}
