import React from "react";
import { IColorfulLookupManyProps } from "./ColorfulLookupMany";

/** Carries {@link IColorfulLookupManyProps} down to the tag slots. */
export const ColorfulLookupManyPropsContext = React.createContext<IColorfulLookupManyProps>(null as any);

/** Returns the props of the enclosing {@link ColorfulLookupMany}. */
export const useColorfulLookupManyProps = () => {
    return React.useContext(ColorfulLookupManyPropsContext);
}
