import type { IXrmAttributeContext } from "../../interfaces";
import type { IXrmDataContextInternal, IXrmFormContextInternal } from "./XrmFormContext";
import { XrmAttribute } from "./XrmAttribute";
import { XrmEntity } from "./XrmEntity";
import { makeItemCollection } from "./collection";

export class XrmData implements IXrmDataContextInternal {
    public readonly entity: XrmEntity;
    public readonly attributes: Xrm.Collection.ItemCollection<IXrmAttributeContext>;
    public readonly process: any;

    private _onLoadHandlerSet: Set<Xrm.Events.DataLoadEventHandler> = new Set();
    private _formContext: IXrmFormContextInternal;

    constructor(formContext: IXrmFormContextInternal) {
        this._formContext = formContext;
        this.entity = new XrmEntity(formContext);
        this.attributes = this._createAttributeCollection();
        this.process = {};
        this._registerEventListeners();
    }

    public getIsDirty(): boolean {
        return this._formContext.getFormXmlModel().getForm().isDirty();
    }

    public isValid(): boolean {
        return this._formContext.getFormXmlModel().getForm().isValid();
    }

    public save(saveOptions?: Xrm.SaveOptions) {
        return this.entity.save(saveOptions);
    }

    public async refresh(save?: boolean): Promise<void> {
        this._formContext.getFormXmlModel().getForm().refresh();
    }

    public addOnLoad(handler: Xrm.Events.DataLoadEventHandler): void {
        this._onLoadHandlerSet.add(handler);
    }

    public removeOnLoad(handler: Xrm.Events.DataLoadEventHandler): void {
        this._onLoadHandlerSet.delete(handler);
    }

    public fireOnLoad(): void {
        this._onLoadHandlerSet.forEach((handler) => {
            try {
                handler({} as any);
            } catch (error) {
                console.error("[Form] XrmData.onLoad handler failed:", error);
            }
        });
    }

    private _createAttributeCollection(): Xrm.Collection.ItemCollection<IXrmAttributeContext> {
        const attributes = this._formContext.getFormXmlModel().getAttributes();
        return makeItemCollection(attributes.map((attribute) => new XrmAttribute(attribute, this._formContext)), (attribute) => attribute.getName()) as any;
    }

    private _registerEventListeners(): void {
        this._formContext.getFormXmlModel().getForm().events.addEventListener('onDestroy', () => {
            this._onLoadHandlerSet.clear();
        });
    }
}
