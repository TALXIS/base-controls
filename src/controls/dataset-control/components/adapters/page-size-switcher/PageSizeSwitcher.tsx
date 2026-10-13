import { useEffect, useMemo } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { DatasetControlUi, IPageSizeSwitcherUiComponents } from "../../ui";
import { LocalizationService, useDataProvider } from "@utils";
import { useRequiredDatasetControlRuntime } from "../root";
import { IPageSizeSwitcherLabels, PAGE_SIZE_SWITCHER_LABELS } from "./labels";
import { DatasetControlPageSizeSwitcher, IDatasetControlPageSizeSwitcherEvents } from "./DatasetControlPageSizeSwitcher";

export interface IPageSizeSwitcherProps {
    /** The sizes the menu offers; read once, at mount. */
    pageSizes?: number[];
    labels?: Partial<IPageSizeSwitcherLabels>;
    components?: Partial<IPageSizeSwitcherUiComponents>;
}

/** Which records the page shows, and how many a page holds. */
export const PageSizeSwitcher = (props: IPageSizeSwitcherProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProvider();
    const pageSizeSwitcher = useMemo(() => new DatasetControlPageSizeSwitcher({ services: runtime.services, provider, pageSizes: props.pageSizes }), []);
    const labels = useMemo(() => new LocalizationService<IPageSizeSwitcherLabels>({ ...PAGE_SIZE_SWITCHER_LABELS, ...props.labels }), [props.labels]);
    const { rerender } = useRerender();
    const range = pageSizeSwitcher.getRecordRange();

    useEventEmitter<IDatasetControlPageSizeSwitcherEvents>(pageSizeSwitcher.events, 'onPageSizeChanged', rerender);
    useEffect(() => () => pageSizeSwitcher.destroy(), []);

    const getText = (): string => {
        const text = labels.getLocalizedString('recordRange', { start: `${range.first}`, end: range.last });
        return range.total === undefined ? text : `${text} ${labels.getLocalizedString('recordTotal', { total: range.total })}`;
    };

    return <DatasetControlUi.PageSizeSwitcher
        text={getText()}
        title={labels.getLocalizedString('pageSizeTooltip')}
        pageSize={pageSizeSwitcher.getPageSize()}
        pageSizes={pageSizeSwitcher.getPageSizes()}
        disabled={pageSizeSwitcher.isLoading()}
        onPageSizeChange={pageSize => pageSizeSwitcher.setPageSize(pageSize)}
        components={props.components} />;
};
