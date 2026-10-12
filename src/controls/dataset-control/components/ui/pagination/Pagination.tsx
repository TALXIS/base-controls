import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { IPaginationUiComponents, PaginationUiComponents } from "./components";
import { getPaginationUiStyles } from "./styles";

export interface IPaginationUiLabels {
    firstPageTooltip: string;
    previousPageTooltip: string;
    nextPageTooltip: string;
    currentPage: string;
}

export interface IPaginationUiProps {
    /** Which side the buttons are drawn against; defaults to `'end'`. */
    align?: 'start' | 'end';
    canMovePrevious: boolean;
    canMoveNext: boolean;
    labels: IPaginationUiLabels;
    onMoveFirst: () => void;
    onMovePrevious: () => void;
    onMoveNext: () => void;
    components?: Partial<IPaginationUiComponents>;
}

/** Moves between pages: first, previous, the current page and next. */
export const Pagination = (props: IPaginationUiProps) => {
    const components = { ...PaginationUiComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getPaginationUiStyles(theme, props.align ?? 'end'), [theme, props.align]);
    return components.onRenderCommandBar({
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
