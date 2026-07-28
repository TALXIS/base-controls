import type { XrmFormContext } from "./XrmFormContext";
import { isPromiseLike } from "./utils";

type XrmOnSaveHandler = Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync;

export class XrmEntity {
    private _formContext: XrmFormContext;
    private _onSaveHandlerSet: Set<XrmOnSaveHandler> = new Set();

    constructor(formContext: XrmFormContext) {
        this._formContext = formContext;
    }

    public getId(): string {
        return this._getRecordReference().id.guid;
    }

    public getEntityName(): string {
        return this._getRecordReference().etn ?? '';
    }

    public getEntityReference(): Xrm.EntityReference {
        const recordReference = this._getRecordReference();
        return {
            Id: recordReference.id.guid,
            TypeName: recordReference.etn ?? '',
            Name: recordReference.name ?? '',
            TypeCode: 0
        };
    }

    public getPrimaryAttributeValue(): string {
        return this._formContext.getFormXmlModel().getForm().getMetadata().PrimaryNameAttribute;
    }

    public isValid(): boolean {
        return this._formContext.getFormXmlModel().getForm().isValid();
    }

    public addOnSave(handler: Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync): void {
        this._onSaveHandlerSet.add(handler);
    }

    public removeOnSave(handler: Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync): void {
        this._onSaveHandlerSet.delete(handler);
    }

    public async save(saveOptions?: Xrm.SaveOptions): Promise<void> {
        return this._formContext.getFormXmlModel().getForm().save({
            blocker: this._createSaveBlocker(),
        });
    }

    get attributes(): Xrm.Collection.ItemCollection<Xrm.Attributes.Attribute> {
        return this._formContext.data.attributes;
    }

    private _createSaveBlocker(): () => Promise<boolean> {
        return async () => {
            const eventState = {
                defaultPrevented: false,
            };

            const handlerResults = Array.from(this._onSaveHandlerSet.values()).map(async (handler) => {
                const eventArgs = this._createSaveEventArgs(eventState);
                const executionContext = this._createSaveEventContext(eventArgs);

                try {
                    const result = handler(executionContext);

                    if (isPromiseLike(result)) {
                        await result;
                    }
                } catch (error) {
                    console.error("[Form] XrmEntity.onSave handler failed:", error);
                }
            });

            await Promise.all(handlerResults);

            return eventState.defaultPrevented;
        };
    }

    private _createSaveEventArgs(eventState: { defaultPrevented: boolean }): Xrm.Events.SaveEventArgumentsAsync {
        return {
            preventDefault: () => {
                eventState.defaultPrevented = true;
            }
        } as any;
    }

    private _createSaveEventContext(eventArgs: Xrm.Events.SaveEventArgumentsAsync): Xrm.Events.SaveEventContextAsync {
        return {
            getEventArgs: () => eventArgs,
        } as any;
    }

    private _getRecordReference(): ComponentFramework.EntityReference {
        return this._formContext.getFormXmlModel().getForm().getRecordReference();
    }
}
