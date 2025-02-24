import { NestedControl } from "./NestedControl";

export class NestedControlError extends Error {
    constructor(message: string, control: NestedControl) {
        super(message);
        this.name = 'NestedControlError';
        control.setError(message);
        control.setLoading(false);
        control.getOptions().callbacks?.onControlStateChanged?.();
    }
}