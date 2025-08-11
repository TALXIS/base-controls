import { ILinkProps } from "@fluentui/react";
import { Property } from "./Property";

export class Url extends Property {
    public getLinkProps(): ILinkProps {
        return {
            href: this.getValue(),
            target: "_blank",
            rel: "noopener noreferrer",
            children: this.getFormattedValue()
        };
    }
}