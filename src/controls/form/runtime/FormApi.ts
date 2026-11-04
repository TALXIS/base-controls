import { IApiField, IFormApi, IFormPartLocator } from "../interfaces";
import { IFormRuntime } from "./FormRuntime";

export interface IFormApiInternal extends IFormApi {
    _getForm(): IFormRuntime;
}

export class FormApi implements IFormApiInternal {
    private _form: IFormRuntime;

    constructor(form: IFormRuntime) {
        this._form = form;
    }

    public get parts(): IFormPartLocator {
        return this._form.parts;
    }

    public _getForm(): IFormRuntime {
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
