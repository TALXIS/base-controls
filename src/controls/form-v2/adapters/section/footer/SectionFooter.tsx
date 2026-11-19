import { Card, ICardFooterProps } from "@ui";
import { useFormSection } from "../context";

/** Props for `FormV2.Section.Footer`. */
export interface ISectionFooterProps extends ICardFooterProps { }

/** The section's bottom band; holds `Footer.Start` and `Footer.End`. */
export const SectionFooter = (props: ISectionFooterProps) => {
    //called only to throw outside a section
    useFormSection();
    return <Card.Footer {...props} />;
};
