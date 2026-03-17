import { IAvailableRelatedColumn } from "@talxis/client-libraries";
import { Selector } from "../selector/Selector";
import { useEditColumns } from "../useEditColumns";
import { useEffect, useState } from "react";


export const ScopeSelector = () => {
    const {model, functions} = useEditColumns();
    const [isDisabled, setIsDisabled] = useState(true);
    const labels = functions.getLabels();

    const getOptionLabel = (column: IAvailableRelatedColumn): string => {
        const relatedEntityDisplayName = column.relatedEntityDisplayName;
        return relatedEntityDisplayName ? `${column.displayName} (${relatedEntityDisplayName})` : column.displayName ?? labels["no-name"];
    }

    useEffect(() => {
        (async () => {
            const options = await model.getAvailableRelatedColumns();
            setIsDisabled(options.length === 1);
        })();
    }, []);

    return <Selector<false, IAvailableRelatedColumn> context="scopeSelector" onOverrideComponentProps={(props) => {
        return {
            ...props,
            isMulti: false,
            isDisabled: isDisabled,
            defaultValue: model.getMainEntityColumn(),
            getOptionValue: (column) => `${column.relatedEntityPrimaryIdAttribute}_${column.name}`,
            getOptionLabel: (column) => getOptionLabel(column),
            loadOptions: (inputValue: string) => model.getAvailableRelatedColumns(inputValue),
            onChange: (column) => model.selectRelatedEntityColumn(column!),
        }
    }} />
}