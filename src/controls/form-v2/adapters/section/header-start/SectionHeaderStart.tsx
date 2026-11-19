import { Card, ICardHeaderStartProps } from "@ui";
import { useFormSection } from "../context";

/** Props for `FormV2.Section.Header.Start`. */
export interface ISectionHeaderStartProps extends ICardHeaderStartProps { }

/** The start of the section's header, holding its title. */
export const SectionHeaderStart = (props: ISectionHeaderStartProps) => {
    //called only to throw outside a section
    useFormSection();
    return <Card.Header.Start {...props} />;
};
