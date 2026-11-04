import { NestedControl } from "./NestedControl";

export class NestedControlError extends Error {
    constructor(error: Omit<Error, 'name'>, control: NestedControl) {
        super(error.message)
        this.name = 'NestedControlError';
        this.stack = error.stack;
        control.setError(error.message);
        control.setLoading(false);
        control.getOptions().callbacks?.onControlStateChanged?.();
    }
}