import React from "react";
import { IPeopleLookupManyProps } from "./PeopleLookupMany";

/** Carries {@link IPeopleLookupManyProps} down to the persona slots. */
export const PeopleLookupManyPropsContext = React.createContext<IPeopleLookupManyProps>(null as any);

/** Returns the props of the enclosing {@link PeopleLookupMany}. */
export const usePeopleLookupManyProps = () => {
    return React.useContext(PeopleLookupManyPropsContext);
}