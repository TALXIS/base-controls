import { IAttributeMetadata, IFieldValidationResult } from "@talxis/client-libraries";
import { IBinding, IOptions } from "../NestedControl";

export abstract class Property {
    private _onGetBinding: () => IBinding;
    private _parentPcfContext: ComponentFramework.Context<any, any>;
    private _attributeMetadata: IAttributeMetadata | undefined;

    constructor(options: IOptions, onGetBinding: () => IBinding) {
        this._onGetBinding = onGetBinding;
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
        return {error: false, errorMessage: ''};
    }
    public getValue(): any {
        return this._binding.value;
    }
    private get _binding() {
        return this._onGetBinding();
    }
}