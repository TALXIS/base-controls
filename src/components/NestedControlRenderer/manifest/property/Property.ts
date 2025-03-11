import { DataType } from "@talxis/client-libraries";
import { Value } from "./Value";

export class Property {
    public readonly defaultValue: string | null;
    public readonly descriptionKey: string | null;
    public readonly displayNameKey: string;
    public readonly name: string;
    public readonly ofTypeGroup: string | null;
    public readonly ofType: DataType | null;
    public readonly required: boolean;
    public readonly usage: 'bound' | 'input' | 'output';
    public readonly values: Map<string, Value> = new Map();
    public readonly isBindingProperty: boolean = false;

    constructor(propertyElement: Element, isBindingProperty: boolean) {
        this.isBindingProperty = isBindingProperty;
        this.defaultValue = propertyElement.getAttribute('default-value')
        this.descriptionKey = propertyElement.getAttribute('description-key');
        this.displayNameKey = propertyElement.getAttribute('display-name-key')!;
        this.name = propertyElement.getAttribute('name')!;
        this.ofTypeGroup = propertyElement.getAttribute('of-type-group');
        this.ofType = propertyElement.getAttribute('of-type') as DataType;
        this.required = propertyElement.getAttribute('required') === 'true';
        this.usage = propertyElement.getAttribute('usage')! as typeof this.usage;
        if (this.ofType === 'Enum') {
            this._createValues(propertyElement);
            for (const value of [...this.values.values()]) {
                if (value.default) {
                    this.defaultValue = value.content;
                }
            }
        }
    }

    private _createValues(propertyElement: Element) {
        const values = propertyElement.querySelectorAll(':scope>value');
        for (const value of values) {
            this.values.set(value.getAttribute('name')!, new Value(value))
        }
    }
}