import { IApiField, IFormApi } from "../interfaces";
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

    public getData(): { [key: string]: any } {
        return this._form.getData();
    }

    public getField(fieldName: string): IApiField {
        return this._form.getField(fieldName);
    }

    public refresh(): void {
        this._form.refresh();
    }
}
