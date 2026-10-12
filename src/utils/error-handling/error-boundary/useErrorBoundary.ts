import { useCallback, useState } from "react";

/** Raises an error into the nearest `ErrorBoundary` from outside a render, such as after an async call. */
export const useErrorBoundary = () => {
    const [, setState] = useState<never>();
    //thrown inside the state update, so React throws it from this component's next render
    const showError = useCallback((exception: unknown): void => setState(() => { throw exception; }), []);
    return { showError };
};
