import { ILookupManyProps, LookupMany } from "../LookupMany";
import { DEFAULT_PEOPLE_LOOKUP_MANY_COMPONENTS } from "./components/components";
import { PeopleLookupManyPropsContext } from "./context";

/** Props for {@link PeopleLookupMany}. */
export interface IPeopleLookupManyProps extends ILookupManyProps {
    /** Column holding each record's avatar URL. */
    imageUrlPropertyName?: string
}

/** A lookup-many picker rendering each record as a persona with an avatar. */
export const PeopleLookupMany = (props: IPeopleLookupManyProps) => {
    const components = { ...DEFAULT_PEOPLE_LOOKUP_MANY_COMPONENTS, ...props.components };
    return <PeopleLookupManyPropsContext.Provider value={props}>
        <LookupMany
            {...props}
            selectedRecordHeight={props.selectedRecordHeight ?? 28}
            components={components}
        />
    </PeopleLookupManyPropsContext.Provider>
}