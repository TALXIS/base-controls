import { FormV2Ui, IFormV2UiSectionBodyProps } from "../../../ui";
import { useFormSection } from "../context";

/** Props for `FormV2.Section.Body`. */
export interface ISectionBodyProps extends IFormV2UiSectionBodyProps { }

/** The section's controls, laid out by its width. */
export const SectionBody = (props: ISectionBodyProps) => {
    //called only to throw outside a section
    useFormSection();
    return <FormV2Ui.SectionBody {...props} />;
};
