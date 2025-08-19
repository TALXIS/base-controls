import { ILinkProps } from "@fluentui/react";
import { Property } from "./Property";

export class Email extends Property {
    public getLinkProps(): ILinkProps {
        return {
            href: `mailto:${this.getValue()}`,
            target: "_blank",
            rel: "noopener noreferrer",
            children: this.getFormattedValue(),
        }
    }
}