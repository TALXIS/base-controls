import { ITheme } from "../Theming";
import { useSurfaceTheme } from "./useSurfaceTheme";
import { IFluentDesignState } from "../ControlTheme";

/**
 * What a callout, menu or tooltip the control opens is drawn in.
 *
 * A host that says what its application looks like has said what a surface over it is drawn in; with none,
 * it is whatever the control was drawn into.
 */
export const useControlSurfaceTheme = (fluentDesignLanguage?: ComponentFramework.FluentDesignState): ITheme => {
    const surfaceTheme = useSurfaceTheme();
    return (fluentDesignLanguage as IFluentDesignState | undefined)?.applicationTheme ?? surfaceTheme;
};
