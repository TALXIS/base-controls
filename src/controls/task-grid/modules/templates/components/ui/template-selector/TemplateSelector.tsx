import type { IDataProvider } from "@talxis/client-libraries";
import { RecordSelector } from "../../../../../components/record-selector";

/** Props for {@link TemplateSelector}. */
export interface ITemplateSelectorProps {
    /** The templates to offer; the selector destroys the provider as it goes. */
    onCreateProvider: () => IDataProvider;
    onTemplateSelected: (templateId: string) => void;
    labels?: { searchPlaceholder?: string; noRecordsFound?: string };
}

/** The template picker, drawn in the New and row add menus. */
export const TemplateSelector = (props: ITemplateSelectorProps) => {
    return <RecordSelector
        onCreateProvider={props.onCreateProvider}
        labels={props.labels}
        onRenderRecord={(recordProps, defaultRender) => defaultRender({ ...recordProps, iconProps: { iconName: 'AddToShoppingList' } })}
        onRecordSelected={props.onTemplateSelected} />;
};
