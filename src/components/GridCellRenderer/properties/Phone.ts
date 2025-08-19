import { Property } from "./Property";

export class Phone extends Property {
    public getLinkProps() {
        return {
            href: `tel:${this.getValue()}`,
            target: "_blank",
            rel: "noopener noreferrer",
            children: this.getFormattedValue(),
        };
    }
}