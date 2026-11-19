import { Card, ICardHeaderProps } from "@ui";
import { useFormSection } from "../context";

/** Props for `FormV2.Section.Header`. */
export interface ISectionHeaderProps extends ICardHeaderProps { }

/** The section's header row; holds `Header.Start` and `Header.End`. */
export const SectionHeader = (props: ISectionHeaderProps) => {
    //called only to throw outside a section
    useFormSection();
    return <Card.Header {...props} />;
};
