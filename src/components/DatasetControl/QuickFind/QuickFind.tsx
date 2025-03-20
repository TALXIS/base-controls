import { IDataset } from "@talxis/client-libraries";
import { ITextFieldProps, TextField } from "@talxis/react-components";
import { datasetControlTranslations } from "../translations";
import { ITranslation } from "../../../hooks";
import { useEffect, useState } from "react";

export interface IQuickFindProps {
    labels: ITranslation<typeof datasetControlTranslations>
    dataset: IDataset;
    onGetQuickFindComponentProps: (props: ITextFieldProps) => ITextFieldProps
}

export const QuickFind = (props: IQuickFindProps) => {
    const {dataset, labels} = {...props};
    const [query, setQuery] = useState<string>('');

    const componentProps = props.onGetQuickFindComponentProps({
        value: query,
        placeholder: `${labels.search()} ${dataset.getMetadata()?.DisplayCollectionName ?? labels.records()}...`,
        onChange: (e, newValue) => setQuery(newValue ?? ''),
        onKeyUp: (e) => {
            if (e.key === 'Enter') {
                onSearch(query);
            }
        },
        deleteButtonProps: query ? {
            key: 'delete',
            iconProps: {
                iconName: 'Cancel'
            },
            onClick: () => {
                setQuery("");
                onSearch(undefined);
            }
        } : undefined,
        suffixItems: [{
            key: 'search',
            iconProps: {
                iconName: 'Search'
            },
            onClick: () => onSearch(query)
        }]
    });

    const onSearch = (query?: string) => {
        dataset.setSearchQuery?.(query ?? "");
        dataset.refresh();
    }

    useEffect(() => {
        setQuery(dataset.getSearchQuery?.() ?? '');
    }, [dataset.getSearchQuery?.()])

    return <TextField {...componentProps} />
}