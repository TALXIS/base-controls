import { IDataset } from "@talxis/client-libraries";
import { TextField } from "@talxis/react-components";
import { datasetControlTranslations } from "../translations";
import { ITranslation } from "../../../hooks";
import { useEffect, useState } from "react";

interface IQuickFindProps {
    labels: ITranslation<typeof datasetControlTranslations>
    dataset: IDataset;
}

export const QuickFind = (props: IQuickFindProps) => {
    const {dataset, labels} = {...props};
    const [query, setQuery] = useState<string>('');

    const onSearch = (query?: string) => {
        dataset.setSearchQuery?.(query ?? "");
        dataset.refresh();
    }

    useEffect(() => {
        setQuery(dataset.getSearchQuery?.() ?? '');
    }, [dataset.getSearchQuery?.()])

    return <TextField
    value={query}
    placeholder={`${labels.search()} ${dataset.getMetadata()?.DisplayCollectionName ?? labels.records()}...`}
    deleteButtonProps={query ? {
        key: 'delete',
        iconProps: {
            iconName: 'Cancel'
        },
        onClick: () => {
            setQuery("");
            onSearch(undefined);
        }
    } : undefined}
    suffixItems={[{
        key: 'search',
        iconProps: {
            iconName: 'Search'
        },
        onClick: () => onSearch(query)
    }]}
    onKeyUp={(e) => {
        if (e.key === 'Enter') {
            onSearch(query);
        }
    }}
    onChange={(e, newValue) => setQuery(newValue ?? '')} />
}