import { createContext, RefObject } from "react";

export const HeaderItemContext = createContext<RefObject<HTMLDivElement> | undefined>(undefined);
