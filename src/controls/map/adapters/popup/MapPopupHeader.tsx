import { IRecordCardHeaderPartsComponents, OptionTag, RecordCardHeader, RecordCardHeaderEnd, RecordCardHeaderStart, RecordCardTitle } from "@ui";
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
    return <RecordCardHeader components={components.header}>
        <RecordCardHeaderStart components={components.headerStart}>
            <RecordCardTitle components={components.title}>{record.getNamedReference().name ?? record.getRecordId()}</RecordCardTitle>
        </RecordCardHeaderStart>
        {status && <RecordCardHeaderEnd components={components.headerEnd}>
            <OptionTag label={status.text} color={status.color} components={components.status} />
        </RecordCardHeaderEnd>}
    </RecordCardHeader>;
};
