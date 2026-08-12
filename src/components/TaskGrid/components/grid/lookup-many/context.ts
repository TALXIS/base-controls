import React from "react";
import { ILookupManyProps } from "./LookupMany";

export const LookupManyPropsContext = React.createContext<ILookupManyProps>(null as any);

export const useLookupManyProps = () => {
    return React.useContext(LookupManyPropsContext);
}   