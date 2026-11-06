import { useEffect, useState } from "react";
import { IAvailableRelatedColumn } from "@talxis/client-libraries";
import { DatasetControlUiEditColumnsSelector, IDatasetControlUiEditColumnsSelectorComponents } from "../edit-columns-selector";

/** Props for the picker of the entity columns are added from, as plain UI. */
export interface IDatasetControlUiEditColumnsScopeSelectorProps {
    /** Drawn above the picker. */
    label: string;
    /** The entity picked at first. */
    defaultValue: IAvailableRelatedColumn;
    /** Shown when no entity matches. */
    noResultsText: string;
    /** Shown while the options load. */
    loadingText: string;
    /** What an option shows. */
    getOptionLabel: (scope: IAvailableRelatedColumn) => string;
    /** Loads the entities matching what is typed. */
    loadOptions: (query?: string) => Promise<IAvailableRelatedColumn[]>;
    /** Called with the entity the user picked. */
    onChange: (scope: IAvailableRelatedColumn) => void;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiEditColumnsSelectorComponents<IAvailableRelatedColumn>>;
}

/** Picks which entity the columns being added come from. */
export const DatasetControlUiEditColumnsScopeSelector = (props: IDatasetControlUiEditColumnsScopeSelectorProps) => {
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        checkScopes();
    }, []);

    //the provider's own entity alone leaves nothing to pick
    const checkScopes = async () => setIsDisabled((await props.loadOptions()).length <= 1);

    return <DatasetControlUiEditColumnsSelector<IAvailableRelatedColumn>
        label={props.label}
        isDisabled={isDisabled}
        defaultValue={props.defaultValue}
        noResultsText={props.noResultsText}
        loadingText={props.loadingText}
        getOptionValue={scope => `${scope.relatedEntityPrimaryIdAttribute}_${scope.name}`}
        getOptionLabel={props.getOptionLabel}
        loadOptions={query => props.loadOptions(query)}
        onChange={scope => scope && props.onChange(scope)}
        components={props.components} />;
};
