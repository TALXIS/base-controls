import React, { useContext }  from "react";
import { IQuickFind } from "../../utils/quick-find/QuickFindBase";

interface IQuickFindInternalContext {
    quickFind: IQuickFind;
    inputValue: string;
}

export const QuickFindContext = React.createContext<IQuickFind >(null as any);

export const QuickFindContextInternal = React.createContext<IQuickFindInternalContext>(null as any);

export const useQuickFind = () => {
    return useContext(QuickFindContextInternal);
}