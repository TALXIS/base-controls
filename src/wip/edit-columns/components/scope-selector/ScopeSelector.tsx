import { IAvailableRelatedColumn } from "@talxis/client-libraries";
import { Selector } from "../selector/Selector";
import { useCallback, useEffect, useState } from "react";
import { useEditColumns, useEditColumnsLabels } from "../../context";
import AsyncSelect, { AsyncProps } from "react-select/async";


export const ScopeSelector = () => {
    const model = useEditColumns();
    const labels = useEditColumnsLabels();
    const [isDisabled, setIsDisabled] = useState(true);

    const getOptionLabel = (column: IAvailableRelatedColumn): string => {
        const relatedEntityDisplayName = column.relatedEntityDisplayName;
        return relatedEntityDisplayName ? `${column.displayName} (${relatedEntityDisplayName})` : column.displayName ?? labels.noName;
    }

    const CustomAsyncSelect = useCallback((props: React.PropsWithChildren<AsyncProps<IAvailableRelatedColumn, false, any>>) => {
        return <AsyncSelect<IAvailableRelatedColumn, false, any> {...props}
            isMulti={false}
            isDisabled={isDisabled}
            defaultValue={model.getScopeColumn()}
            getOptionValue={(column) => `${column.relatedEntityPrimaryIdAttribute}_${column.name}`}
            getOptionLabel={(column) => getOptionLabel(column)}
            loadOptions={(inputValue: string) => model.getAvailableScopeColumns(inputValue)}
            onChange={(column) => model.setScopeColumn(column!)}
         />
    }, [isDisabled]);

    useEffect(() => {
        (async () => {
            const options = await model.getAvailableScopeColumns();
            setIsDisabled(options.length === 1);
        })();
    }, []);

    return <Selector components={{
        Select: CustomAsyncSelect
    }} />
}