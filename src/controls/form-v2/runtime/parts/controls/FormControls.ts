import { ServiceRegistry } from "@core";
import type { IFormControl } from "../control/FormControl";

/** The form's controls, by name. */
export interface IFormControls {
    /** The controls drawn, by name. */
    readonly parts: ServiceRegistry<{ [name: string]: IFormControl }>;
    /** @throws While no control of that name is drawn. */
    get(name: string): IFormControl;
    find(name: string): IFormControl | undefined;
    /** In the order they are drawn. */
    getAll(): IFormControl[];
}

export class FormControls implements IFormControls {
    public readonly parts = new ServiceRegistry<{ [name: string]: IFormControl }>();

    public get(name: string): IFormControl {
        return this.parts.get(name);
    }

    public find(name: string): IFormControl | undefined {
        return this.parts.find(name);
    }

    public getAll(): IFormControl[] {
        return this.parts.getAll();
    }

    public destroy(): void {
        this.parts.destroy();
    }
}
