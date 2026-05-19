import React from "react";
import { ITagLookupManyProps } from "./TagLookupMany";

export const TagLookupManyPropsContext = React.createContext<ITagLookupManyProps>(null as any);

export const useTagLookupManyProps = () => {
    return React.useContext(TagLookupManyPropsContext);
}
