import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IBindings, IComponent, IOutputs } from "../../interfaces/context";

export interface ISingleLineText extends IComponent<ISingleLineTextBindings, ISingleLineTextOutputs> {
}

interface ISingleLineTextBindings extends IBindings {
    /** default `true`    */
    EnableBorder?: ITwoOptionsProperty;
    /**
    * Decides whether the input should get focus on first render.
     */
    AutoFocus?: ITwoOptionsProperty;
    EnableCopyButton?: ITwoOptionsProperty;
    EnableDeleteButton?: ITwoOptionsProperty;
    value: IStringProperty;
}

interface ISingleLineTextOutputs extends IOutputs {
    value: string | null
}