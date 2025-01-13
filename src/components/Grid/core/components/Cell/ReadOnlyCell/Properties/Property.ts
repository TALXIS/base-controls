import { IAttributeMetadata, IFieldValidationResult } from "@talxis/client-libraries";
import { IBinding, IOptions } from "../Component/Control";

export abstract class Property {

    private _binding;
    private _parentPcfContext: ComponentFramework.Context<any, any>;
    private _attributeMetadata: IAttributeMetadata | undefined;

    constructor(binding: IBinding, options: IOptions) {
        this._binding = binding;
        this._parentPcfContext = options.parentPcfContext;
    }
    public async init(): Promise<boolean> {
        const bindingMetadata = this._binding.metadata;
        if(!bindingMetadata) {
            return true;
        }
        const metadata =  await this.parentPcfContext.utils.getEntityMetadata(bindingMetadata.enitityName, [bindingMetadata.attributeName]);
        this._attributeMetadata = metadata.Attributes.get(bindingMetadata.attributeName).attributeDescriptor
        return true;
    };
    
    public abstract getParameter(): any;

    public get parentPcfContext() {
        return this._parentPcfContext;
    }
    public get attributeMetadata(): IAttributeMetadata | undefined {
        return this._attributeMetadata;
    }
    public get dataType() {
        return this._binding.type;
    }
    public getValidationResult(): IFieldValidationResult {
        return this._binding.validator?.(this._binding.valueGetter()) ?? {error: true, errorMessage: 'Forced Error'}
    }
    public getValue(): any {
        return this._binding.valueGetter();
    }
}