import { Card, ICardHeaderEndProps } from "@ui";
import { useFormSection } from "../context";

/** Props for `FormV2.Section.Header.End`. */
export interface ISectionHeaderEndProps extends ICardHeaderEndProps { }

/** The end of the section's header, such as its buttons. */
export const SectionHeaderEnd = (props: ISectionHeaderEndProps) => {
    //called only to throw outside a section
    useFormSection();
    return <Card.Header.End {...props} />;
};
