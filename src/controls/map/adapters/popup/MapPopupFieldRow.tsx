import { IRecordCardFieldRowComponents, RecordCardFieldRow } from "@ui";
import { useMap, useMapRecord } from "../../context";

export interface IMapPopupFieldRowProps {
    columnName: string;
    iconName?: string;
    components?: Partial<IRecordCardFieldRowComponents>;
}

/** One column of the record under its display name, nothing while empty. */
export const MapPopupFieldRow = (props: IMapPopupFieldRowProps) => {
    const record = useMapRecord();
    const provider = useMap().services.get('provider');
    const value = record.getFormattedValue(props.columnName);
    if (!value) {
        return null;
    }
    const label = provider.getColumnsMap()[props.columnName]?.displayName ?? props.columnName;
    return <RecordCardFieldRow label={label} iconName={props.iconName} components={props.components}>{value}</RecordCardFieldRow>;
};
