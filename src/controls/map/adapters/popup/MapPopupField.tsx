import { getSelectedOptions } from "@data";
import { IFieldValueComponents, Field } from "@ui";
import { useMap, useMapRecord } from "../../context";

export interface IMapPopupFieldProps {
    columnName: string;
    iconName?: string;
    components?: Partial<IFieldValueComponents>;
}

/** One column of the record under its display name, an option set's as tags; nothing while empty. */
export const MapPopupField = (props: IMapPopupFieldProps) => {
    const record = useMapRecord();
    const provider = useMap().services.get('provider');
    const value = record.getFormattedValue(props.columnName);
    if (!value) {
        return null;
    }
    const column = provider.getColumnsMap()[props.columnName];
    const label = column?.displayName ?? props.columnName;
    const options = column ? getSelectedOptions(record.getValue(props.columnName), column) : [];
    return <Field.Value label={label} iconName={props.iconName} components={props.components}>
        {options.length > 0 ? options.map(option => <Field.OptionSet key={option.value} label={option.label} color={option.color} />) : value}
    </Field.Value>;
};
