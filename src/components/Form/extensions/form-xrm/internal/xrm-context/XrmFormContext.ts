import type { IFormXmlModel } from "../internal/FormXmlForm";
import type { IXrmDataContext, IXrmFormContext, IXrmUiContext } from "./interfaces";
import { XrmData } from "./XrmData";
import { XrmUi } from "./XrmUi";

export interface IXrmDataContextInternal extends IXrmDataContext {
    fireOnLoad(): void;
}

export interface IXrmUiContextInternal extends IXrmUiContext {
    fireOnLoad(): void;
}

export interface IXrmFormContextInternal extends IXrmFormContext {
    readonly data: IXrmDataContextInternal;
    readonly ui: IXrmUiContextInternal;
    getFormXmlModel(): IFormXmlModel;
}

class XrmFormContextInstance implements IXrmFormContextInternal {
    private _formXmlModel: IFormXmlModel;
    public readonly data: IXrmDataContextInternal;
    public readonly ui: IXrmUiContextInternal;

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

export const createXrmFormContext = (formXmlModel: IFormXmlModel): IXrmFormContextInternal => {
    return new XrmFormContextInstance(formXmlModel);
};
