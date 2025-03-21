import { IDataset } from "@talxis/client-libraries";
import { ITextFieldProps, ITheme, TextField } from "@talxis/react-components";
import { datasetControlTranslations } from "../translations";
import { ITranslation } from "../../../hooks";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@fluentui/react";
import { IQuickFindProps } from "../interfaces";

export interface IQuickFindComponentProps {
    labels: ITranslation<typeof datasetControlTranslations>
    dataset: IDataset;
    theme: ITheme;
    onGetQuickFindComponentProps: (props: IQuickFindProps) => IQuickFindProps;
}

export const QuickFind = (props: IQuickFindComponentProps) => {
    const { dataset, labels, theme } = { ...props };
    const [query, setQuery] = useState<string>('');

    const quickFindProps = props.onGetQuickFindComponentProps({
        container: {
            theme: theme
        },
        textFieldProps: {
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
        }
    })
    const onSearch = (query?: string) => {
        dataset.setSearchQuery?.(query ?? "");
        dataset.refresh();
    }

    useEffect(() => {
        setQuery(dataset.getSearchQuery?.() ?? '');
    }, [dataset.getSearchQuery?.()])
    //needs to be wrapped within ThemeProvider because the theme context can be lost if we are overriding the header render
    return <ThemeProvider {...quickFindProps.container}><TextField {...quickFindProps.textFieldProps} /></ThemeProvider>
}