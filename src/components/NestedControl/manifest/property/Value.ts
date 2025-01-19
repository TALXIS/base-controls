export class Value {
    public readonly name: string;
    public readonly displayNameKey: string;
    public readonly descriptionKey: string | null;
    public readonly default: boolean;
    public readonly content: string;

    constructor(valueElement: Element) {
        this.name = valueElement.getAttribute('name')!;
        this.displayNameKey = valueElement.getAttribute('display-name-key')!
        this.descriptionKey = valueElement.getAttribute('description-key');
        this.default = valueElement.getAttribute('default') === 'true';
        this.content = valueElement.innerHTML;
    }
}