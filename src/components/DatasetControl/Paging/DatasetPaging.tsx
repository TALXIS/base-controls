import { CommandBarButton, ContextualMenuItemType, IContextualMenuItem, ThemeProvider } from "@fluentui/react";
import { useControl } from "../../../hooks";
import { IDatasetPaging } from "./interfaces";
import { getPagingStyles } from "./styles";
import { useMemo } from "react";
import { Paging } from "./Paging";
import { CommandBar } from "@talxis/react-components";
import { datasetPagingTranslations } from "./translations";

const PAGE_SIZE_OPTIONS = ['25', '50', '75', '100', '250'];

export const DatasetPaging = (props: IDatasetPaging) => {
    const { labels, theme } = useControl('DatasetPaging', props, datasetPagingTranslations);
    const styles = useMemo(() => getPagingStyles(theme), [theme]);
    const paging = useMemo(() => new Paging(() => props.parameters, () => labels), []);
    const parameters = props.parameters;
    const dataset = parameters.Dataset;

    const getPageSizeOptions = (): IContextualMenuItem[] => {
        return PAGE_SIZE_OPTIONS.map(size => {
            return {
                key: size,
                text: size,
                checked: parseInt(size) === paging.pageSize,
                className: styles.pageSizeOption,
                onClick: () => paging.setPageSize(parseInt(size))
            }
        })
    }
    return (
        <ThemeProvider theme={theme} className={styles.datasetPagingRoot}>
            <div className={styles.pageSizeBtnWrapper}>
                <CommandBarButton
                    disabled={dataset.loading || !paging.isEnabled}
                    text={paging.toString()}
                    menuProps={parameters.EnablePageSizeSwitcher?.raw !== false ? {
                        items: [
                            {
                                key: 'header',
                                itemType: ContextualMenuItemType.Header,
                                text: labels['page-record-count'](),
                            },
                            {
                                key: 'divider',
                                itemType: ContextualMenuItemType.Divider,
                            },
                            ...getPageSizeOptions()
                        ]
                    } : undefined}
                />
            </div>
            {paging.isEnabled &&
                <CommandBar
                    className={styles.pagination}
                    items={[]}
                    farItems={[{
                        key: 'FirstPage',
                        iconOnly: true,
                        iconProps: { iconName: 'DoubleChevronLeft' },
                        disabled: !paging.hasPreviousPage || dataset.loading,
                        onClick: () => paging.reset()
                    }, {
                        key: 'PreviousPage',
                        iconOnly: true,
                        iconProps: { iconName: 'Back' },
                        disabled: !paging.hasPreviousPage || dataset.loading,
                        onClick: () => paging.loadPreviousPage()
                    }, {
                        key: 'CurrentPage',
                        text: `${labels['paging-page']()} ${paging.pageNumber.toString()}`,
                        className: styles.currentPageBtn,
                        disabled: true,
                    }, {
                        key: 'NextPage',
                        iconOnly: true,
                        iconProps: { iconName: 'Forward' },
                        disabled: !paging.hasNextPage || dataset.loading,
                        onClick: () => paging.loadNextPage()
                    }]}
                />
            }
        </ThemeProvider>
    )



}