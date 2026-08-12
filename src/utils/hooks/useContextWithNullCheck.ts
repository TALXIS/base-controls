import React from "react";

export const useContextWithNullCheck = <T,>(context: React.Context<T | null>): T => {
    const value = React.useContext(context);
    if (!value) {
        throw new Error(`This component must be rendered within ${context.displayName}.Provider.`);
    }
    return value;
};
