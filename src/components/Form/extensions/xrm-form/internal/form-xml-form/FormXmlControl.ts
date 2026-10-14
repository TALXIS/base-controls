import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import type { IBinding } from "@components/NestedControlRenderer/interfaces";
import type { MetadataFormXmlControl, MetadataFormXmlControlDescriptions, MetadataFormXmlLabels, MetadataFormXmlOpaqueElement, MetadataFormXmlOpaqueNode, MetadataFormXmlPrimitiveValue, FormXmlControlParameters, IFormXmlCell, IFormXmlControl, IFormXmlControlConfiguration, IFormXmlControlEvents } from "./interfaces";

export class FormXmlControl implements IFormXmlControl {
    public readonly events: IEventEmitter<IFormXmlControlEvents> = new EventEmitter<IFormXmlControlEvents>();
    public id?: string | undefined;
    public uniqueid?: string | undefined;
    public classid?: string | undefined;
    public labelid?: string | undefined;
    public datafieldname?: string | undefined;
    public disabled?: boolean | undefined;
    public addedby?: string | undefined;
    public isunbound?: boolean | undefined;
    public isrequired?: boolean | undefined;
    public relationship?: string | undefined;
    public indicationOfSubgrid?: boolean | undefined;
    public labels?: MetadataFormXmlLabels | undefined;
    public parameters?: FormXmlControlParameters | undefined;
    public additionalAttributes?: Record<string, MetadataFormXmlPrimitiveValue> | undefined;
    public additionalElements?: MetadataFormXmlOpaqueNode[] | undefined;

    private _cell: IFormXmlCell;

    constructor(control: MetadataFormXmlControl, cell: IFormXmlCell) {
        Object.assign(this, control);
        this._cell = cell;
    }

    public getDisabled(): boolean {
        return this.disabled ?? false;
    }

    public setDisabled(disabled: boolean): void {
        if (this.getDisabled() === disabled) return;
        this.disabled = disabled;
        this.events.dispatchEvent("onDisabledChanged", disabled);
    }

    public getCell(): IFormXmlCell {
        return this._cell;
    }

    public getControlName(clientFormFactor: number): string | undefined {
        const description = this._getControlDescription();
        if (!description) return undefined;
        this._validateFormFactor(clientFormFactor);
        return description.customControl?.find(item => item.name && item.formFactor === clientFormFactor - 1)?.name;
    }

    public getControlParameters(clientFormFactor: number): Record<string, IBinding> | undefined {
        return this._getControlConfiguration(clientFormFactor)?.parameters;
    }

    private _getControlDescription(): NonNullable<MetadataFormXmlControlDescriptions['controlDescription']>[number] | undefined {
        if (!this.uniqueid) {
            return undefined;
        }
        const normalizeControlId = (id: string): string => id.replace(/[{}]/g, '').toLowerCase();
        const controlId = normalizeControlId(this.uniqueid);
        return this.getCell().formXmlModel.controlDescriptions?.controlDescription?.find(item => normalizeControlId(item.forControl) === controlId);
    }

    private _getControlConfiguration(clientFormFactor: number): IFormXmlControlConfiguration | undefined {
        const description = this._getControlDescription();
        if (description) this._validateFormFactor(clientFormFactor);
        const controls = description?.customControl ?? [];
        const customControl = controls.find(item => item.name && item.formFactor === clientFormFactor - 1)
            ?? controls.find(item => !item.name && item.formFactor === clientFormFactor - 1)
            ?? controls.find(item => !item.name && item.formFactor === undefined);
        if (!customControl && !this.parameters) return undefined;
        const parameters = {
            ...this._getControlParameters(customControl?.parameters?.additionalElements ?? [], !!customControl?.name),
            ...this._getDirectControlParameters(),
        };
        return { name: customControl?.name, parameters };
    }

    private _validateFormFactor(clientFormFactor: number): void {
        if (![1, 2, 3].includes(clientFormFactor)) {
            throw new Error('Unsupported client form factor.');
        }
    }

    private _getDirectControlParameters(): Record<string, IBinding> {
        const bindings: Record<string, IBinding> = {};
        for (const [name, value] of Object.entries(this.parameters ?? {})) {
            if (name === 'additionalElements' || name === 'additionalAttributes' || name === 'datafieldname' || value === undefined) continue;
            bindings[name] = this._getDirectBinding(name, value);
        }
        for (const node of this.parameters?.additionalElements ?? []) {
            if (node.kind !== 'element') continue;
            if (node.name === 'datafieldname') continue;
            bindings[node.name] = this._getStaticXmlBinding(node);
        }
        return bindings;
    }

    private _getDirectBinding(name: string, value: unknown): IBinding {
        if (name === 'value') throw new Error('Direct parameter "value" is reserved for the field binding.');
        if (typeof value === 'string') return { type: 'SingleLine.Text', isStatic: true, value };
        if (typeof value === 'boolean') return { type: 'TwoOptions', isStatic: true, value };
        if (typeof value === 'number' && Number.isFinite(value)) {
            return { type: Number.isInteger(value) ? 'Whole.None' : 'Decimal', isStatic: true, value };
        }
        throw new Error(`Direct parameter "${name}" must be a scalar string, boolean or finite number; structural parameters are not supported.`);
    }

    private _getStaticXmlBinding(parameter: MetadataFormXmlOpaqueElement): IBinding {
        const value = this._getParameterText(parameter);
        const type = parameter.attributes.type;
        if (type === 'Whole.None') {
            if (parameter.name === 'value') throw new Error('Static parameter "value" is reserved for the field binding.');
            const number = Number(value);
            if (!value.trim() || !Number.isInteger(number)) throw new Error(`Parameter "${parameter.name}" must be a whole number.`);
            return { type, isStatic: true, value: number };
        }
        if (type && type !== 'SingleLine.Text' && type !== 'Enum') {
            throw new Error('Only SingleLine.Text, Enum or Whole.None static parameters are supported; lookup parameters must be field-bound.');
        }
        return this._getDirectBinding(parameter.name, value);
    }

    private _getParameterText(parameter: MetadataFormXmlOpaqueElement): string {
        let value = '';
        for (const child of parameter.children) {
            if (child.kind === 'element') throw new Error('Nested parameters are not supported.');
            if (child.kind === 'text' || child.kind === 'cdata') value += child.value;
        }
        return value;
    }

    private _getControlParameters(nodes: readonly MetadataFormXmlOpaqueNode[], requiresField: boolean): Record<string, IBinding> {
        const parameters = nodes.filter((node): node is MetadataFormXmlOpaqueElement => node.kind === 'element');
        const isStatic = (parameter: MetadataFormXmlOpaqueElement): boolean =>
            [true, 'true', 1, '1'].includes(parameter.attributes.static ?? false);
        const fieldCount = parameters.filter(parameter => !isStatic(parameter)).length;
        if (fieldCount > 1 || (requiresField && fieldCount !== 1)) {
            throw new Error('Only one field-bound parameter is supported.');
        }
        const staticParameters: Record<string, IBinding> = {};
        for (const parameter of parameters) {
            const value = this._getParameterText(parameter);
            const type = parameter.attributes.type;
            if (isStatic(parameter)) {
                if (parameter.name === 'value') {
                    throw new Error('Static parameter "value" is reserved for the field binding.');
                }
                if (!type) throw new Error('Static custom control parameters must specify a type.');
                staticParameters[parameter.name] = this._getStaticXmlBinding(parameter);
            } else {
                if (!this.datafieldname || value.trim() !== this.datafieldname) {
                    throw new Error('The parameter must reference this control\'s field.');
                }
                if (type && type !== 'SingleLine.Text' && type !== 'Whole.None' && type !== 'Lookup.Simple') {
                    throw new Error('Only SingleLine.Text, Whole.None or Lookup.Simple field-bound parameters are supported.');
                }
            }
        }
        return staticParameters;
    }
}
