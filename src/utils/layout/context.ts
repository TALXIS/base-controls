import React from "react";

export const CompactContext = React.createContext<boolean>(false);

CompactContext.displayName = "CompactContext";

/** Whether the nearest `CompactProvider`'s box is at or below its breakpoint; `false` without one. */
export const useCompact = (): boolean => React.useContext(CompactContext);
