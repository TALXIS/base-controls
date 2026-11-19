import { ServiceRegistry } from "@core";
import type { IFormSection } from "../section/FormSection";

/** The form's sections, by name. */
export interface IFormSections {
    /** The sections drawn, by name. */
    readonly parts: ServiceRegistry<{ [name: string]: IFormSection }>;
    /** @throws While no section of that name is drawn. */
    get(name: string): IFormSection;
    find(name: string): IFormSection | undefined;
    /** In the order they are drawn. */
    getAll(): IFormSection[];
}

export class FormSections implements IFormSections {
    public readonly parts = new ServiceRegistry<{ [name: string]: IFormSection }>();

    public get(name: string): IFormSection {
        return this.parts.get(name);
    }

    public find(name: string): IFormSection | undefined {
        return this.parts.find(name);
    }

    public getAll(): IFormSection[] {
        return this.parts.getAll();
    }

    public destroy(): void {
        this.parts.destroy();
    }
}
