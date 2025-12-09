import { ILinkProps } from "@fluentui/react";
import { Sanitizer } from "@talxis/client-libraries";
import { Property } from "./Property";

export class Lookup extends Property {
    public getLinkProps(): ILinkProps {
        return {
            target: "_blank",
            rel: "noopener noreferrer",
            children: this.getFormattedValue(),
            onClick: () => this.openRecord(Sanitizer.Lookup.getEntityReference(this.getValue()[0]))
        };
    }
}