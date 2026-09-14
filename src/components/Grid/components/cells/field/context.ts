import { createContext, useContext } from "react";
import { GridField } from "../../../services/fields";

export const GridFieldContext = createContext<GridField | undefined>(undefined);
GridFieldContext.displayName = 'GridField';

/**
 * The field this component is bound to, or `undefined` where nothing bound one.
 *
 * Undefined rather than a throw: binding a field is the consumer's to do, so anything that merely adapts
 * to one has to draw without one. What cannot draw without one asks {@link useRequiredGridField}.
 */
export const useGridField = (): GridField | undefined => {
    return useContext(GridFieldContext);
};

/** The field this component is bound to, throwing where nothing bound one. */
export const useRequiredGridField = (): GridField => {
    const field = useGridField();
    if (!field) {
        throw new Error('This has to be drawn inside Grid.Field, which is what binds it to a record\'s column.');
    }
    return field;
};
