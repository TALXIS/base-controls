import { useMemo, useRef, useState } from "react";
import { Grid } from "../Grid";
import { useControl } from "../../hooks";
import { ThemeProvider } from "@fluentui/react";
import { TextField } from "@talxis/react-components";
import { datasetControlTranslations } from "./translations";
import { getDatasetControlStyles } from "./styles";
import { IDatasetControl } from "./interfaces";
import { useRerender } from "./hooks/useRerender";

export const DatasetControl = (props: IDatasetControl) => {
    const { labels, theme } = useControl('DatasetControl', props, datasetControlTranslations);
    const [query, setQuery] = useState<string | undefined>("");
    const rerender = useRerender();
    const dataset = props.parameters.Grid;
    const injectedContextRef = useRef(props.context);
    const styles = useMemo(() => getDatasetControlStyles(), []);
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    //@ts-ignore - need to edit the types
    dataset._setRenderer(() => rerender());

    //we need to have a way to customize the init behavior from above
    const componentProps = onOverrideComponentProps({
        onDatasetInit: () => dataset.refresh()
    })

    useMemo(() => {
        //@ts-ignore - need to edit the types
        injectedContextRef.current = dataset.injectContext(props.context);
    }, [props.context]);

    useMemo(() => {
        componentProps.onDatasetInit();
    }, []);

    const onSearch = (query?: string) => {
        //@ts-ignore - need to edit the types
        dataset.setSearchQuery(query);
        dataset.refresh();
    }

    return (
        <ThemeProvider theme={theme} applyTo="none" className={styles.root}>
            {props.parameters.EnableQuickFind?.raw &&
                <TextField
                    className={styles.quickFind}
                    value={query}
                    //@ts-ignore - displaycollectionanem is string
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
                    onChange={(e, newValue) => setQuery(newValue)} />
            }
            <Grid {...props} context={injectedContextRef.current} />
        </ThemeProvider>
    )
}