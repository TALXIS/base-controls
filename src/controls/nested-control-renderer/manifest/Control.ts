import { Property } from "./property/Property";
import { TypeGroup } from "./TypeGroup";

export class Control {
    public readonly namespace: string;
    public readonly constructorName: string;
    public readonly version: string;
    public readonly displayNameKey: string;
    public readonly descriptionKey: string;
    public readonly controlType: string;
    public readonly previewImage: string;
    public readonly properties: Map<string, Property> = new Map();
    public readonly typegroups: Map<string, TypeGroup> = new Map();

    constructor(controlElement: Element) {
        this.namespace = controlElement.getAttribute('namespace')!;
        this.constructorName = controlElement.getAttribute('constructor')!;
        this.version = controlElement.getAttribute('version')!;
        this.displayNameKey = controlElement.getAttribute('display-name-key')!;
        this.descriptionKey = controlElement.getAttribute('description-key')!;
        this.controlType = controlElement.getAttribute('control-type')!;
        this.previewImage = controlElement.getAttribute('previewImage')!;
        this._createProperties(controlElement);
        this._createTypeGroups(controlElement);
    }
    
    private _createProperties(controlElement: Element) {
        const propertyElements = controlElement.querySelectorAll(':scope>property');
        let bindingPropertyFound = false;
        for (const propertyElement of propertyElements) {
            const usage = propertyElement.getAttribute('usage');
            let isBindingProperty = false;
            if (usage === 'bound' && !bindingPropertyFound) {
                bindingPropertyFound = true;
                isBindingProperty = true;
            }
            this.properties.set(propertyElement.getAttribute('name')!, new Property(propertyElement, isBindingProperty));
        }
    }
    private _createTypeGroups(controlElement: Element) {
        const typeGroupElements = controlElement.querySelectorAll(':scope>type-group');
        for (const typeGroupElement of typeGroupElements) {
            this.typegroups.set(typeGroupElement.getAttribute('name')!, new TypeGroup(typeGroupElement));
        }
    }
}