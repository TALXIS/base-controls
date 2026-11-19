import { useEventEmitter, useRerender } from "@core";
import type { ICardComponents } from "@ui";
import { FormSection, IFormSectionEvents } from "../../../runtime/parts/section/FormSection";
import { FormV2Ui } from "../../../ui";
import { useFormV2, useProvideFormSection } from "../../root";
import { useOptionalFormTab } from "../../tab";
import { FormSectionContext } from "../context";

/** Props for `FormV2.Section`. */
export interface ISectionProps {
    /** Unique among the form's sections; `form.sections.get(name)` finds it. */
    name: string;
    /** Initial value; `Section.Title` shows it. */
    label?: string;
    /** Initial value; defaults to `true`. */
    visible?: boolean;
    /** Its `Header`, `Body` and `Footer`. */
    children?: React.ReactNode;
    /** Replacements for the card's slots. */
    components?: Partial<ICardComponents>;
}

/** A group of controls in a card, composed of `Section.Header`, `Section.Body` and `Section.Footer`. */
export const SectionRoot = (props: ISectionProps) => {
    const { name, label, visible } = props;
    const form = useFormV2();
    const tab = useOptionalFormTab();
    const section = useProvideFormSection(name, () => new FormSection({ name, form, tab, label, visible }));
    const { rerender } = useRerender();

    useEventEmitter<IFormSectionEvents>(section.events, 'onVisibleChanged', rerender);

    return <FormSectionContext.Provider value={section}>
        <FormV2Ui.Section hidden={!section.isVisible()} components={props.components}>
            {props.children}
        </FormV2Ui.Section>
    </FormSectionContext.Provider>;
};
