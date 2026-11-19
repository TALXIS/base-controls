import { Card, ICardFooterStartProps } from "@ui";
import { useFormSection } from "../context";

/** Props for `FormV2.Section.Footer.Start`. */
export interface ISectionFooterStartProps extends ICardFooterStartProps { }

/** The start of the section's footer. */
export const SectionFooterStart = (props: ISectionFooterStartProps) => {
    //called only to throw outside a section
    useFormSection();
    return <Card.Footer.Start {...props} />;
};
