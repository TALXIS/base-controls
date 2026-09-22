import React from "react";
import { ITheme } from "../interfaces";

/** What a thing opened over the application is drawn in, where that is not what it was opened from. */
export const SurfaceThemeContext = React.createContext<ITheme | undefined>(undefined);
