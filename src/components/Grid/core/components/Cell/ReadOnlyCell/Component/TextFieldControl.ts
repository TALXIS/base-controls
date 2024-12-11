import { ITextField } from "../../../../../../TextField";
import { Control } from "./Control";

export class TextFieldControl extends Control {
    public async init(): Promise<boolean> {
        return true;
    }
    public getProps(): ITextField {
        const validation = this._controlHandler.getValidationResult();
        return {
            context: this._controlHandler.getParentContext(),
            parameters: {
                isResizable: {
                    raw: false,

                },
                NotifyOutputChangedOnUnmount: {
                    raw: true,
                },
                value: {
                    raw: this._controlHandler.getBindingValue(),
                    type: this._controlHandler.getColumn().dataType,
                    //@ts-ignore - typings
                    formatted: this._controlHandler.getFormattedBindingValue(),
                    error: validation?.error === false,
                    errorMessage: validation?.errorMessage ?? ""
                }
            },
            onNotifyOutputChanged: (outputs) => this._onNotifyOutputChanged(outputs)
        }
    }
}