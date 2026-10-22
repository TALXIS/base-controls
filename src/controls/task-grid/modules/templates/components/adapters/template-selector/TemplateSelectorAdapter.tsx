import type { ITemplates } from "../../../Templates";
import { TemplateSelector } from "../../ui";

export interface ITemplateSelectorAdapterProps {
    templates: ITemplates;
    onTemplateSelected: (templateId: string) => void;
}

/** The template selector over a provider the module makes each time it opens. */
export const TemplateSelectorAdapter = (props: ITemplateSelectorAdapterProps) => {
    const { templates } = props;
    const labels = templates.getLabels();
    return <TemplateSelector
        onCreateProvider={() => templates.createTemplatesProvider()}
        labels={{ searchPlaceholder: labels.getLocalizedString('searchTemplates'), noRecordsFound: labels.getLocalizedString('noTemplates') }}
        onTemplateSelected={props.onTemplateSelected} />;
};
