import { IFormApi } from "../interfaces";
import { IForm } from "./FormModel";

export interface IFormApiInternal extends IFormApi {
    _getForm(): IForm;
}

export class FormApi implements IFormApiInternal {
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
