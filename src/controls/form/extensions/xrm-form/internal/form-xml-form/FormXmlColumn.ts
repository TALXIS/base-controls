import type { IFormXmlColumn, IFormXmlModel, IFormXmlSection, MetadataFormXmlColumn, MetadataFormXmlSections } from "./interfaces";
import { FormXmlSection } from "./FormXmlSection";

export class FormXmlColumn implements IFormXmlColumn {
    public width: string = '100%';
    public sections?: MetadataFormXmlSections | undefined;

    private _sections: IFormXmlSection[] = [];

    constructor(column: MetadataFormXmlColumn, formXmlModel: IFormXmlModel) {
        Object.assign(this, column);
        this._sections = column.sections?.section?.map(section => new FormXmlSection(section, formXmlModel)) ?? [];
    }

    public getSections(): IFormXmlSection[] {
        return this._sections;
    }

    public getVisibleSections(): IFormXmlSection[] {
        return this._sections.filter(section => section.getVisible());
    }
}
