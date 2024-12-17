import { IFieldValidationResult } from "@talxis/client-libraries";
import { IBinding, IOptions } from "../Component/Control";

export abstract class Property {
    private _binding;
    private _parentPcfContext: ComponentFramework.Context<any, any>;
    constructor(binding: IBinding, options: IOptions) {
        this._binding = binding;
        this._parentPcfContext = options.parentPcfContext;
    }
    public abstract init(): Promise<boolean>;
    public abstract getParameter(): any;

    public get parentPcfContext() {
        return this._parentPcfContext;
    }
    public get metadata() {
        return this._binding.metadata
    }
    public get dataType() {
        return this._binding.type;
    }
    public getValidationResult(): IFieldValidationResult {
        return this._binding.validator?.(this._binding.valueGetter()) ?? {error: false, errorMessage: ''}
    }
    public getValue(): any {
        return this._binding.valueGetter();
    }
}