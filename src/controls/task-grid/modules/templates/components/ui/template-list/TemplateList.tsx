import { IRecordListItem, RecordList } from "../../../../../components/record-selector";
import { ITemplateListComponents, TemplateListComponents } from "./components";

export interface ITemplateListProps {
    templates: IRecordListItem[];
    onTemplateSelected: (templateId: string) => void;
    components?: Partial<ITemplateListComponents>;
}

/** The templates of the selector's current page, each a button that creates its tasks. */
export const TemplateList = (props: ITemplateListProps) => {
    const components = { ...TemplateListComponents, ...props.components };
    return <RecordList
        records={props.templates}
        onRecordSelected={props.onTemplateSelected}
        components={{ onRenderRecord: buttonProps => components.onRenderTemplate({ ...buttonProps, iconProps: { iconName: 'AddToShoppingList' } }) }} />;
};
