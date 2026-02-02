import { IAvailableRelatedColumn } from "@talxis/client-libraries";
import { Selector } from "../Selector/Selector";
import { useEditColumns } from "../useEditColumns";
import { useEffect, useState } from "react";
import { useModel } from "../../useModel";


export const ScopeSelector = () => {
    const editColumnsModel = useEditColumns();
    const [isDisabled, setIsDisabled] = useState(true);
    const labels = useModel().getLabels();

    const getOptionLabel = (column: IAvailableRelatedColumn): string => {
        const relatedEntityDisplayName = column.relatedEntityDisplayName;
        return relatedEntityDisplayName ? `${column.displayName} (${relatedEntityDisplayName})` : column.displayName ?? labels['no-name']();
    }

    useEffect(() => {
        (async () => {
            const options = await editColumnsModel.getAvailableRelatedColumns();
            setIsDisabled(options.length === 1);
        })();
    }, []);

    return <Selector<false, IAvailableRelatedColumn> onOverrideComponentProps={(props) => {
        return {
            ...props,
            isMulti: false,
            isDisabled: isDisabled,
            defaultValue: editColumnsModel.getMainEntityColumn(),
            getOptionValue: (column) => `${column.relatedEntityPrimaryIdAttribute}_${column.name}`,
            getOptionLabel: (column) => getOptionLabel(column),
            loadOptions: (inputValue: string) => editColumnsModel.getAvailableRelatedColumns(inputValue),
            onChange: (column) => editColumnsModel.selectRelatedEntityColumn(column!),
        }
    }} />
}