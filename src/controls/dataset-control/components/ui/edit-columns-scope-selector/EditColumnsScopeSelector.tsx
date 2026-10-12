import { useEffect, useState } from "react";
import { IAvailableRelatedColumn } from "@talxis/client-libraries";
import { EditColumnsSelector, IEditColumnsSelectorUiComponents } from "../edit-columns-selector";

export interface IEditColumnsScopeSelectorUiProps {
    label: string;
    defaultValue: IAvailableRelatedColumn;
    noResultsText: string;
    getOptionLabel: (scope: IAvailableRelatedColumn) => string;
    onLoadOptions: (query?: string) => Promise<IAvailableRelatedColumn[]>;
    onChange: (scope: IAvailableRelatedColumn) => void;
    components?: Partial<IEditColumnsSelectorUiComponents<IAvailableRelatedColumn>>;
}

/** Picks which entity the columns being added come from. */
export const EditColumnsScopeSelector = (props: IEditColumnsScopeSelectorUiProps) => {
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        checkScopes();
    }, []);

    //the provider's own entity alone leaves nothing to pick
    const checkScopes = async () => setIsDisabled((await props.onLoadOptions()).length <= 1);

    return <EditColumnsSelector<IAvailableRelatedColumn>
        label={props.label}
        isDisabled={isDisabled}
        defaultValue={props.defaultValue}
        noResultsText={props.noResultsText}
        getOptionValue={scope => `${scope.relatedEntityPrimaryIdAttribute}_${scope.name}`}
        getOptionLabel={props.getOptionLabel}
        loadOptions={query => props.onLoadOptions(query)}
        onChange={scope => scope && props.onChange(scope)}
        components={props.components} />;
};
