import { ILookupManyProps, LookupMany } from "../LookupMany";
import { DEFAULT_PEOPLE_LOOKUP_MANY_COMPONENTS } from "./components";

export interface IPeopleLookupManyProps extends ILookupManyProps {

}

export const PeopleLookupMany = (props: ILookupManyProps) => {
    const components = {...DEFAULT_PEOPLE_LOOKUP_MANY_COMPONENTS, ...props.components};
    return <LookupMany 
        {...props}
        components={components}
         />
}