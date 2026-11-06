import { createContext, useContext } from "react";
import type { ILookupManyUiSelectComponents } from "./components";

export interface ILookupManySelectContext {
    components: ILookupManyUiSelectComponents;
    onRemove: (reference: ComponentFramework.EntityReference) => void;
    getRemoveText: (reference: ComponentFramework.EntityReference) => string;
}

export const LookupManySelectContext = createContext<ILookupManySelectContext | null>(null);

/** The picker a react-select slot is drawn in. */
export const useLookupManySelectContext = (): ILookupManySelectContext => useContext(LookupManySelectContext)!;
