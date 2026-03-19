import { IAvailableRelatedColumn } from "@talxis/client-libraries";
import { Selector } from "../selector/Selector";
import { useEffect, useState } from "react";
import { useEditColumns, useEditColumnsLabels } from "../context";
import AsyncSelect from "react-select/async";


export const ScopeSelector = () => {
    const model = useEditColumns();
    const labels = useEditColumnsLabels();
    const [isDisabled, setIsDisabled] = useState(true);

    const getOptionLabel = (column: IAvailableRelatedColumn): string => {
        const relatedEntityDisplayName = column.relatedEntityDisplayName;
        return relatedEntityDisplayName ? `${column.displayName} (${relatedEntityDisplayName})` : column.displayName ?? labels.noName;
    }

    useEffect(() => {
        (async () => {
            const options = await model.getAvailableRelatedColumns();
            setIsDisabled(options.length === 1);
        })();
    }, []);

    return <Selector components={{
        Select: (props) => <AsyncSelect<IAvailableRelatedColumn, false, any> {...props}
            isMulti={false}
            isDisabled={isDisabled}
            defaultValue={model.getMainEntityColumn()}
            getOptionValue={(column) => `${column.relatedEntityPrimaryIdAttribute}_${column.name}`}
            getOptionLabel={(column) => getOptionLabel(column)}
            loadOptions={(inputValue: string) => model.getAvailableRelatedColumns(inputValue)}
            onChange={(column) => model.selectRelatedEntityColumn(column!)}
         />
    }} />
}