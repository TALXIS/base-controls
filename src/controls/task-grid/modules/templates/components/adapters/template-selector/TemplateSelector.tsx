import { useLabels } from "@utils";
import { useDatasetControlModule } from "@controls/dataset-control";
import { RecordSelector } from "../../../../../components/record-selector";
import { TEMPLATES_LABELS } from "../../../labels";
import { TemplateList } from "../../ui";

export interface ITemplateSelectorProps {
    onTemplateSelected: (templateId: string) => void;
}

/** The template selector over a provider the module makes each time it opens. */
export const TemplateSelector = (props: ITemplateSelectorProps) => {
    const templates = useDatasetControlModule('templates');
    const labels = useLabels(TEMPLATES_LABELS);
    return <RecordSelector
        onCreateProvider={() => templates.createTemplatesProvider()}
        labels={{ searchPlaceholder: labels.get('templates.searchTemplates'), noRecordsFound: labels.get('templates.noTemplates') }}
        onRecordSelected={props.onTemplateSelected}
        components={{
            frame: templates.components.selector,
            onRenderList: listProps => <TemplateList templates={listProps.records} onTemplateSelected={listProps.onRecordSelected} components={templates.components.list} />,
        }} />;
};
