import { useLabels } from "@utils";
import { LEGACY_DATASET_CONTROL_LABELS } from "../../labels";
import { IAvailableRelatedColumn } from "@talxis/client-libraries";
import { Selector } from "../selector/Selector";
import { useEditColumns } from "../useEditColumns";
import { useEffect, useState } from "react";


export const ScopeSelector = () => {
    const editColumnsModel = useEditColumns().model;
    const [isDisabled, setIsDisabled] = useState(true);
    const labels = useLabels(LEGACY_DATASET_CONTROL_LABELS);

    const getOptionLabel = (column: IAvailableRelatedColumn): string => {
        const relatedEntityDisplayName = column.relatedEntityDisplayName;
        return relatedEntityDisplayName ? `${column.displayName} (${relatedEntityDisplayName})` : column.displayName ?? labels.get('legacyDatasetControl.noName');
    }

    useEffect(() => {
        (async () => {
            const options = await editColumnsModel.getAvailableRelatedColumns();
            setIsDisabled(options.length === 1);
        })();
    }, []);

    return <Selector<false, IAvailableRelatedColumn> context="scopeSelector" onOverrideComponentProps={(props) => {
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