import React from "react";
import { IPeopleLookupManyProps } from "./PeopleLookupMany";

export const PeopleLookupManyPropsContext = React.createContext<IPeopleLookupManyProps>(null as any);

export const usePeopleLookupManyProps = () => {
    return React.useContext(PeopleLookupManyPropsContext);
}