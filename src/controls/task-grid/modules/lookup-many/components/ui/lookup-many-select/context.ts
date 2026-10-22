import { createContext, useContext } from "react";
import type { ILookupManySelectComponents } from "./components";

export interface ILookupManySelectContext {
    components: ILookupManySelectComponents;
    onRemove: (reference: ComponentFramework.EntityReference) => void;
}

export const LookupManySelectContext = createContext<ILookupManySelectContext | null>(null);

/** The picker a react-select slot is drawn in. */
export const useLookupManySelectContext = (): ILookupManySelectContext => useContext(LookupManySelectContext)!;
