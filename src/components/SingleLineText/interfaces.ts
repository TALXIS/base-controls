import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IContext, IInputs, IOutputs } from "../../interfaces/context";

export interface ISingleLineText extends IContext<ISingleLineTextInputs, ISingleLineTextOutputs> {
    /** default `true`    */
    EnableBorder?: ITwoOptionsProperty;
    /**
    * Decides whether the input should get focus on first render.
     */
    AutoFocus?: ITwoOptionsProperty;
    EnableCopyButton?: ITwoOptionsProperty;
    EnableDeleteButton?: ITwoOptionsProperty;
}

interface ISingleLineTextInputs extends IInputs {
    value: IStringProperty;
}

interface ISingleLineTextOutputs extends IOutputs {
    value: string | null
}