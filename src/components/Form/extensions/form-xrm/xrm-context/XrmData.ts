import type { XrmFormContext } from "./XrmFormContext";
import { XrmAttribute } from "./XrmAttribute";
import { XrmEntity } from "./XrmEntity";
import { makeItemCollection } from "./collection";
import { notImplemented } from "./utils";

export class XrmData {
    public readonly entity: XrmEntity;
    public readonly attributes: Xrm.Collection.ItemCollection<Xrm.Attributes.Attribute>;
    public readonly process: any;

    private _onLoadHandlerSet: Set<Xrm.Events.DataLoadEventHandler> = new Set();
    private _formContext: XrmFormContext;

    constructor(formContext: XrmFormContext) {
        this._formContext = formContext;
        this.entity = new XrmEntity(formContext);
        this.attributes = this._createAttributeCollection();
        this.process = {};
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

    public refresh(save?: boolean): Xrm.Async.PromiseLike<any> {
        void save;
        notImplemented("data.refresh");
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

    private _createAttributeCollection(): Xrm.Collection.ItemCollection<Xrm.Attributes.Attribute> {
        const attributes = this._formContext.getFormXmlModel().getAttributes();
        const xrmAttributes = attributes.map((a) => new XrmAttribute(a, this._formContext));
        return makeItemCollection(xrmAttributes, (a) => a.getName()) as any;
    }
}
