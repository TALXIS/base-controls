import { useTheme } from "@theme";
import { useMemo } from "react";

import { IDatasetControlUiPaginationComponents, DatasetControlUiPaginationComponents } from "./components";
import { getDatasetControlUiPaginationStyles } from "./styles";

/** The strings of the pagination, as plain UI. */
export interface IDatasetControlUiPaginationLabels {
    /** The first page button's tooltip. */
    firstPageTooltip: string;
    /** The previous page button's tooltip. */
    previousPageTooltip: string;
    /** The next page button's tooltip. */
    nextPageTooltip: string;
    /** The current page's text. */
    currentPage: string;
}

/** Props for the pagination, as plain UI. */
export interface IDatasetControlUiPaginationProps {
    /** Which side the buttons are drawn against; defaults to `'end'`. */
    align?: 'start' | 'end';
    /** Enables the first and previous page buttons. */
    canMovePrevious: boolean;
    /** Enables the next page button. */
    canMoveNext: boolean;
    /** The pagination's strings. */
    labels: IDatasetControlUiPaginationLabels;
    /** Called by the first page button. */
    onMoveFirst: () => void;
    /** Called by the previous page button. */
    onMovePrevious: () => void;
    /** Called by the next page button. */
    onMoveNext: () => void;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiPaginationComponents>;
}

/** Moves between pages: first, previous, the current page and next. */
export const DatasetControlUiPagination = (props: IDatasetControlUiPaginationProps) => {
    const components = { ...DatasetControlUiPaginationComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getDatasetControlUiPaginationStyles(theme, props.align ?? 'end'), [theme, props.align]);
    return components.onRender({
        className: styles.datasetControlPagination,
        styles: { primarySet: styles.buttons },
        items: [
            { key: 'firstPage', iconOnly: true, title: props.labels.firstPageTooltip, iconProps: { iconName: 'DoubleChevronLeft' }, disabled: !props.canMovePrevious, onClick: props.onMoveFirst },
            { key: 'previousPage', iconOnly: true, title: props.labels.previousPageTooltip, iconProps: { iconName: 'Back' }, disabled: !props.canMovePrevious, onClick: props.onMovePrevious },
            { key: 'currentPage', text: props.labels.currentPage, className: styles.currentPage, disabled: true },
            { key: 'nextPage', iconOnly: true, title: props.labels.nextPageTooltip, iconProps: { iconName: 'Forward' }, disabled: !props.canMoveNext, onClick: props.onMoveNext },
        ],
    });
};
