import { FieldValue, IAttributeMetadata} from "@talxis/client-libraries";
import { IOptions } from "../NestedControl";
import { IBinding } from "../interfaces";

export abstract class Property {
    private _onGetBinding: () => IBinding;
    private _parentPcfContext: ComponentFramework.Context<any, any>;
    private _attributeMetadata: IAttributeMetadata = {} as any;

    constructor(options: IOptions, onGetBinding: () => IBinding) {
        this._onGetBinding = onGetBinding;
        this._parentPcfContext = options.parentPcfContext;
    }
    public abstract getParameter(): any;

    //this init will be sync if onOverrideMetadata was provided and no attributeName and entityName has been provided
    public async init(): Promise<boolean> {
        const bindingMetadata = this._binding.metadata;
        if(!bindingMetadata) {
            return true;
        }
        if(typeof bindingMetadata.attributeName === 'string' && typeof bindingMetadata.entityName === 'string') {
            const metadata = await this.parentPcfContext.utils.getEntityMetadata(bindingMetadata.entityName, [bindingMetadata.attributeName]);
            this._attributeMetadata = metadata.Attributes.get(bindingMetadata.attributeName).attributeDescriptor ?? {};
        }
        if(bindingMetadata.onOverrideMetadata) {
            this._attributeMetadata = bindingMetadata.onOverrideMetadata(this._attributeMetadata);
        }
        return true;
    };
    

    public get parentPcfContext() {
        return this._parentPcfContext;
    }
    public get attributeMetadata(): any {
        return this._attributeMetadata;
    }
    public get dataType() {
        return this._binding.type;
    }
    public getValue(): any {
        return this._binding.value;
    }
    public getFormattedValue(): string | undefined {
        return this._binding.formattedValue ?? new FieldValue(this.getValue(), this.dataType, this._attributeMetadata).getFormattedValue() ?? undefined;
    }
    private get _binding() {
        return this._onGetBinding();
    }
}