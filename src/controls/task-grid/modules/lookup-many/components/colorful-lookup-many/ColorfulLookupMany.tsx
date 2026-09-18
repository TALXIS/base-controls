import { ILookupManyProps, LookupMany } from "../LookupMany";
import { DEFAULT_TAG_LOOKUP_MANY_COMPONENTS } from "./components";
import { ColorfulLookupManyPropsContext } from "./context";

/** Props for {@link ColorfulLookupMany}. */
export interface IColorfulLookupManyProps extends ILookupManyProps {
    /** Column holding each record's colour. */
    colorPropertyName?: string;
}

/** A lookup-many picker rendering each record as a coloured tag. */
export const ColorfulLookupMany = (props: IColorfulLookupManyProps) => {
    const components = { ...DEFAULT_TAG_LOOKUP_MANY_COMPONENTS, ...props.components };
    return <ColorfulLookupManyPropsContext.Provider value={props}>
        <LookupMany
            {...props}
            components={components}
        />
    </ColorfulLookupManyPropsContext.Provider>
}
