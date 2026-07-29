import type { IFormXmlSection } from "../internal/FormXmlForm";
import { makeItemCollection } from "./collection";
import type { XrmControl } from "./XrmControl";
import type { XrmFormContext } from "./XrmFormContext";

export class XrmSection {
    private _formContext: XrmFormContext;
    private _section: IFormXmlSection;

    constructor(section: IFormXmlSection, formContext: XrmFormContext) {
        this._formContext = formContext;
        this._section = section;
    }

    public getName(): string {
        return this._section.name ?? '';
    }

    public getLabel(): string {
        return this._section.getLabel() ?? '';
    }

    public setLabel(label: string): void {
        this._section.setLabel(label);
    }

    public getVisible(): boolean {
        return this._section.getVisible();
    }

    public setVisible(visible: boolean): void {
        this._section.setVisible(visible);
    }

    public get controls(): Xrm.Collection.ItemCollection<XrmControl> {
        const controls = this._formContext.ui.controls.get();
        const sectionFormXmlControlsMap = new Map(this._section.getControls().map((c) => [c.id, c]));
        const sectionControls = controls.filter((c) => sectionFormXmlControlsMap.has(c.getName()));
        return makeItemCollection(sectionControls, (c) => c.getName()) as any;
    }
}
