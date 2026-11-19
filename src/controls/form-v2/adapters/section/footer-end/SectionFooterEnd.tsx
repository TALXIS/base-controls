import { Card, ICardFooterEndProps } from "@ui";
import { useFormSection } from "../context";

/** Props for `FormV2.Section.Footer.End`. */
export interface ISectionFooterEndProps extends ICardFooterEndProps { }

/** The end of the section's footer, such as its buttons. */
export const SectionFooterEnd = (props: ISectionFooterEndProps) => {
    //called only to throw outside a section
    useFormSection();
    return <Card.Footer.End {...props} />;
};
