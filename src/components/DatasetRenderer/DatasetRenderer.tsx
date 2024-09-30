import { useMemo, useRef, useState } from "react";
import { Grid } from "../Grid";
import { useControl } from "../../hooks";
import { IDatasetRenderer } from "./interfaces";
import { ThemeProvider } from "@fluentui/react";
import { TextField } from "@talxis/react-components";
import { datasetTranslations } from "./translations";

export const DatasetRenderer = (props: IDatasetRenderer) => {
    const { labels, theme } = useControl('DatasetRenderer', props, datasetTranslations);
    const [query, setQuery] = useState<string | undefined>("");
    const dataset = props.parameters.Grid;
    const injectedContextRef = useRef(props.context);

    useMemo(() => {
        dataset.refresh();
    }, []);
    useMemo(() => {
        //@ts-ignore - need to edit the types
        injectedContextRef.current = dataset.injectContext(props.context);
    }, []);

    const onSearch = (query?: string) => {
        //@ts-ignore - need to edit the types
        dataset.setSearchQuery(query);
        dataset.refresh();
    }

    return (
        <ThemeProvider theme={theme} applyTo="none">
            <TextField
                value={query}
                //@ts-ignore - displaycollectionanem is string
                placeholder={`${labels.search()} ${dataset.getMetadata()?.DisplayCollectionName ?? labels.records()}...`}
                deleteButtonProps={query ? {
                    key: 'delete',
                    iconProps: {
                        iconName: 'Cancel'
                    },
                    onClick: () => {
                        setQuery(undefined);
                        onSearch();
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
                onChange={(e, newValue) => setQuery(newValue)} />
            <Grid {...props} context={injectedContextRef.current} />
        </ThemeProvider>
    )
}