import React from "react";
import { IColorfulLookupManyProps } from "./ColorfulLookupMany";

export const ColorfulLookupManyPropsContext = React.createContext<IColorfulLookupManyProps>(null as any);

export const useColorfulLookupManyProps = () => {
    return React.useContext(ColorfulLookupManyPropsContext);
}
