import { useLabels } from "@utils";
import type { ITemplates } from "../../../Templates";
import { TEMPLATES_LABELS } from "../../../labels";
import { TemplateSelector } from "../../ui";

export interface ITemplateSelectorAdapterProps {
    templates: ITemplates;
    onTemplateSelected: (templateId: string) => void;
}

/** The template selector over a provider the module makes each time it opens. */
export const TemplateSelectorAdapter = (props: ITemplateSelectorAdapterProps) => {
    const { templates } = props;
    const labels = useLabels(TEMPLATES_LABELS);
    return <TemplateSelector
        onCreateProvider={() => templates.createTemplatesProvider()}
        labels={{ searchPlaceholder: labels.get('templates.searchTemplates'), noRecordsFound: labels.get('templates.noTemplates') }}
        onTemplateSelected={props.onTemplateSelected} />;
};
