import { IDecimal } from "../../../../../../Decimal";
import { Control } from "./Control";

export class DecimalControl extends Control {
    public async init(): Promise<boolean> {
        return true;
    }
    public getProps(): IDecimal {
        throw new Error("Method not implemented.");
    }
}