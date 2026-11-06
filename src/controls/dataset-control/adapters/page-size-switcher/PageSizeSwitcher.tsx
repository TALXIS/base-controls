import { useEffect } from "react";
import { useEventEmitter, useRerender } from "@core";
import { useLabels } from "@labels";
import { DatasetControlUi, IDatasetControlUiPageSizeSwitcherComponents } from "../../ui";
import { useDataProvider } from "@data";
import { useRegisterDatasetControlPart } from "../root";
import { PAGE_SIZE_SWITCHER_LABELS } from "./labels";
import { DatasetControlPageSizeSwitcher, IDatasetControlPageSizeSwitcherEvents } from "../../runtime/parts/page-size-switcher/DatasetControlPageSizeSwitcher";

/** Props for `DatasetControl.PageSizeSwitcher`. */
export interface IPageSizeSwitcherProps {
    /** The sizes the menu offers; read once, at mount. */
    pageSizes?: number[];
    /** Replacements for the switcher's slots. */
    components?: Partial<IDatasetControlUiPageSizeSwitcherComponents>;
}

/** Which records the page shows, and how many a page holds. */
export const PageSizeSwitcher = (props: IPageSizeSwitcherProps) => {
    const provider = useDataProvider();
    const pageSizeSwitcher = useRegisterDatasetControlPart('pageSizeSwitcher', () => new DatasetControlPageSizeSwitcher({ provider, pageSizes: props.pageSizes }));
    const labels = useLabels(PAGE_SIZE_SWITCHER_LABELS);
    const { rerender } = useRerender();
    const range = pageSizeSwitcher.getRecordRange();

    useEventEmitter<IDatasetControlPageSizeSwitcherEvents>(pageSizeSwitcher.events, 'onChanged', rerender);
    useEffect(() => () => pageSizeSwitcher.destroy(), []);

    const getText = (): string => {
        const text = labels.get('pageSizeSwitcher.recordRange', { start: range.first, end: range.last });
        return range.total === undefined ? text : `${text} ${labels.get('pageSizeSwitcher.recordTotal', { total: range.total })}`;
    };

    return <DatasetControlUi.PageSizeSwitcher
        text={getText()}
        title={labels.get('pageSizeSwitcher.pageSizeTooltip')}
        pageSize={pageSizeSwitcher.getPageSize()}
        pageSizes={pageSizeSwitcher.getPageSizes()}
        disabled={pageSizeSwitcher.isLoading()}
        onPageSizeChange={pageSize => pageSizeSwitcher.setPageSize(pageSize)}
        components={props.components} />;
};
