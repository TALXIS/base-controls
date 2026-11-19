import { useEventEmitter, useRerender } from "@core";
import { Card, ICardTitleProps } from "@ui";
import type { IFormSectionEvents } from "../../../runtime/parts/section/FormSection";
import { useFormSection } from "../context";

/** Props for `FormV2.Section.Title`. */
export interface ISectionTitleProps extends Omit<ICardTitleProps, 'children'> { }

/** The section's label, as its part holds it. */
export const SectionTitle = (props: ISectionTitleProps) => {
    const section = useFormSection();
    const { rerender } = useRerender();
    useEventEmitter<IFormSectionEvents>(section.events, 'onLabelChanged', rerender);
    return <Card.Title {...props}>{section.getLabel()}</Card.Title>;
};
