import { useLabels } from "@labels";
import { useDatasetControlModule } from "@controls/dataset-control";
import { RecordListComponents } from "../../ui/record-selector/record-list/components";
import { RecordSelector } from "../record-selector/RecordSelector";
import { TEMPLATES_LABELS } from "../../labels";

export interface ITemplateSelectorProps {
    onTemplateSelected: (templateId: string) => void;
}

/** The template selector over a provider the module makes each time it opens. */
export const TemplateSelector = (props: ITemplateSelectorProps) => {
    const templates = useDatasetControlModule('templates');
    const labels = useLabels(TEMPLATES_LABELS);
    const onRenderRecord = templates.components.list?.onRenderRecord ?? RecordListComponents.onRenderRecord;
    return <RecordSelector
        onCreateProvider={() => templates.createTemplatesProvider()}
        labels={{ searchPlaceholder: labels.get('templates.searchTemplates'), noRecordsFound: labels.get('templates.noTemplates') }}
        onRecordSelected={props.onTemplateSelected}
        components={{
            frame: templates.components.selector,
            list: { onRenderRecord: buttonProps => onRenderRecord({ ...buttonProps, iconProps: { iconName: 'AddToShoppingList' } }) },
        }} />;
};
