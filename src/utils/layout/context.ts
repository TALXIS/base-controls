import React from "react";

export const CompactContext = React.createContext<boolean>(false);

CompactContext.displayName = "CompactContext";

/** Whether the nearest `BreakpointCompactProvider` or `WrapCompactProvider` asks for compact parts; `false` without one. */
export const useCompact = (): boolean => React.useContext(CompactContext);
