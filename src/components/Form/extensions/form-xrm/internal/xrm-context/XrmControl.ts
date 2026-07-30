import type { IFormXmlCell, IFormXmlControl } from "../FormXmlForm";
import type { IXrmAttributeContext, IXrmControlContext } from "../../interfaces";
import type { IXrmFormContextInternal } from "./XrmFormContext";
import { notImplemented } from "./utils";

export class XrmControl implements IXrmControlContext {
    private _control: IFormXmlControl;
    private _formContext: IXrmFormContextInternal;
    private _cell: IFormXmlCell;

    constructor(control: IFormXmlControl, formContext: IXrmFormContextInternal) {
        this._formContext = formContext;
        this._control = control;
        this._cell = control.getCell();
    }

    public getName(): string {
        return this._control.id ?? '';
    }

    public getVisible(): boolean {
        return this._cell.getVisible();
    }

    public setVisible(visible: boolean): void {
        this._cell.setVisible(visible);
    }

    public getDisabled(): boolean {
        return this._control.getDisabled();
    }

    public setDisabled(disabled: boolean): void {
        this._control.setDisabled(disabled);
    }

    public getLabel(): string {
        return this._cell.getLabel() ?? '';
    }

    public setLabel(label: string): void {
        this._cell.setLabel(label);
    }

    public getAttribute(): IXrmAttributeContext | null {
        if (this._control.datafieldname) {
            return this._formContext.data.attributes.get(this._control.datafieldname) as any;
        }
        return null;
    }

    public getControlType(): Xrm.Controls.ControlType {
        return 'standard';
    }

    public focus(): void {
        notImplemented("XrmControl.focus");
    }

    public addNotification(notification: any) {
        notImplemented("XrmControl.addNotification");
    }

    public clearNotification(uniqueId?: string) {
        notImplemented("XrmControl.clearNotification");
    }
}
