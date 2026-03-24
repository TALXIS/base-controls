import React, { useContext }  from "react";
import { IQuickFind } from "../../utils/quick-find/QuickFindBase";

export const QuickFindContext = React.createContext<IQuickFind >(null as any);

export const useQuickFind = () => {
    return useContext(QuickFindContext);
}