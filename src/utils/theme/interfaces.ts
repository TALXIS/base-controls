import { DeepPartial } from "@talxis/client-libraries";
import { ITheme } from "@talxis/react-components";

export interface IFluentDesignState extends ComponentFramework.FluentDesignState {
    tokenTheme: {
        [key: string]: any;
        fluentV8Overrides?: DeepPartial<ITheme>;
    }
}