import React from "react";
import { ILookupManyProps } from "./LookupMany";

/** Carries {@link ILookupManyProps} down to the picker slots. */
export const LookupManyPropsContext = React.createContext<ILookupManyProps>(null as any);

/** Returns the props of the enclosing {@link LookupMany}. */
export const useLookupManyProps = () => {
    return React.useContext(LookupManyPropsContext);
}   