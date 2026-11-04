import { Control } from "./Control";

export class Manifest {
    public readonly control: Control;

    constructor(manifestXmlString: string) {
        const xmlDoc = new DOMParser().parseFromString(manifestXmlString, "text/xml");
        const controlElement = xmlDoc.querySelector("control")!;
        this.control = new Control(controlElement);
    }
}