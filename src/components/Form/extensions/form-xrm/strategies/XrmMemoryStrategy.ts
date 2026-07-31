import { IMemoryStrategyParams, MemoryStrategy } from "@components/Form/stragegies";
import type { IXrmFormStrategy } from "../interfaces";

interface IXrmMemoryStrategyParams extends IMemoryStrategyParams {
    onGetFormXml: () => string;
}

export class XrmMemoryStrategy extends MemoryStrategy implements IXrmFormStrategy {
    private _onGetFormXml: () => string;

    constructor(params: IXrmMemoryStrategyParams) {
        super(params);
        this._onGetFormXml = params.onGetFormXml;
    }
    public onGetFormXml(): string {
        return this._onGetFormXml();
    }
}