import { DataType } from "@talxis/client-libraries";


export class TypeGroup {
    public readonly name: string;
    public readonly types: DataType[] = [];

    constructor(typeGroupElement: Element) {
        this.name = typeGroupElement.getAttribute('name')!;
        const types = typeGroupElement.querySelectorAll(':scope>type');
        for (const type of types as any) {
            this.types.push(type.innerHTML);
        }
    }
}