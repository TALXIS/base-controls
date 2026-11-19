import { Card, IRecordCardHeaderPartsComponents, OptionTag } from "@ui";
import { useMap, useMapRecord } from "../../context";

export interface IMapPopupHeaderProps {
    /** An option set column shown beside the name as a tag in its option's colour. */
    statusColumnName?: string;
    components?: IRecordCardHeaderPartsComponents;
}

/** The record's name, with its status beside it. */
export const MapPopupHeader = (props: IMapPopupHeaderProps) => {
    const record = useMapRecord();
    const provider = useMap().services.get('provider');
    const getStatus = () => {
        const text = props.statusColumnName && record.getFormattedValue(props.statusColumnName);
        if (!props.statusColumnName || !text) {
            return undefined;
        }
        const value = record.getValue(props.statusColumnName);
        const options = provider.getColumnsMap()[props.statusColumnName]?.metadata?.OptionSet ?? [];
        return { text, color: options.find(option => String(option.Value) === String(value))?.Color };
    };
    const status = getStatus();
    const components = props.components ?? {};
    return <Card.Header components={components.header}>
        <Card.Header.Start components={components.headerStart}>
            <Card.Title components={components.title}>{record.getNamedReference().name ?? record.getRecordId()}</Card.Title>
        </Card.Header.Start>
        {status && <Card.Header.End components={components.headerEnd}>
            <OptionTag label={status.text} color={status.color} components={components.status} />
        </Card.Header.End>}
    </Card.Header>;
};
