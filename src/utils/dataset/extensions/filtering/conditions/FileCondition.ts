import { Operators } from "@talxis/client-libraries";
import { Condition } from "./Condition";

export class FileCondition extends Condition {
    public getDataType() {
        return null
    }
    protected _getDefaultConditionOperator() {
        return Operators.NotNull.Value;
    }
    protected _getControlValue(): null {
        return null;
    }

    protected _getFilterValue(value: any): string | string[] | null {
        return null;
    }
}