import { Card } from "@ui";
import { useMap, useMapRecord } from "../../context";
import { IMapPopupRendererComponents } from "./components";
import { MapPopupHeader } from "./MapPopupHeader";
import { MapPopupFieldList } from "./MapPopupFieldList";
import { MapPopupField } from "./MapPopupField";

export interface IMapPopupRendererProps {
    components?: IMapPopupRendererComponents;
}

/** The default popup: the record's name, and its visible columns that hold a value. */
export const MapPopupRenderer = (props: IMapPopupRendererProps) => {
    const components = props.components ?? {};
    const record = useMapRecord();
    const provider = useMap().services.get('provider');
    const columns = provider.getColumns().filter(column => !column.isHidden && !column.isPrimary && !!record.getFormattedValue(column.name));

    return <>
        <MapPopupHeader components={components.header} />
        {columns.length > 0 && <Card.Body components={components.body}>
            <MapPopupFieldList components={components.fieldList}>
                {columns.map(column => <MapPopupField key={column.name} columnName={column.name} components={components.field} />)}
            </MapPopupFieldList>
        </Card.Body>}
    </>;
};
