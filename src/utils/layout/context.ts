import React from "react";

export const CompactContext = React.createContext<boolean>(false);

CompactContext.displayName = "CompactContext";

/** Whether the nearest `CompactProvider`'s box is at most its `maxCompactWidth` wide; `false` without one. */
export const useCompact = (): boolean => React.useContext(CompactContext);
