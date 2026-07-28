import { IForm } from "./Form";

/**
 * Public-facing API contract exposed to form consumers.
 */
export interface IFormApi {
    refresh: () => void;
}

/**
 * Public-facing form API implementation.
 */
export class FormApi implements IFormApi {
    private _form: IForm;

    constructor(form: IForm) {
        this._form = form;
    }
    public refresh(): void {
        this._form.refresh();
    }
}