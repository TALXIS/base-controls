import type { IFormXmlModel } from "../FormXmlForm";
import { XrmData } from "./XrmData";
import { XrmUi } from "./XrmUi";

export class XrmFormContext {
    private _formXmlModel: IFormXmlModel;
    readonly data: XrmData;
    readonly ui: XrmUi;

    constructor(formXmlModel: IFormXmlModel) {
        this._formXmlModel = formXmlModel;
        this.data = new XrmData(this);
        this.ui = new XrmUi(this);
    }

    public getAttribute(nameOrIndexOrDelegate?: any): any {
        return this.data.attributes.get(nameOrIndexOrDelegate);
    }

    public getControl(nameOrIndexOrDelegate?: any): any {
        return this.ui.controls.get(nameOrIndexOrDelegate);
    }

    public getFormXmlModel(): IFormXmlModel {
        return this._formXmlModel;
    }
}
