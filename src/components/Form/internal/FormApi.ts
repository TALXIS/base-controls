import type { FormApi } from "../interfaces";
import { IForm } from "./FormModel";

export interface IFormApiInternal extends FormApi {
    _getForm(): IForm;
}

export class InternalFormApi implements IFormApiInternal {
    private _form: IForm;

    constructor(form: IForm) {
        this._form = form;
    }

    public _getForm(): IForm {
        return this._form;
    }

    public refresh(): void {
        this._form.refresh();
    }
}
