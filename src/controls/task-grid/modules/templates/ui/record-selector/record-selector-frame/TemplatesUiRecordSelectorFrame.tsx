import { useMemo } from "react";
import type { IDatasetControlUiHeaderComponents, IDatasetControlUiQuickFindComponents } from "@controls/dataset-control";
import { getClassNames } from "@core";
import { WrapCompactProvider } from "@ui";
import { ITemplatesUiRecordSelectorFrameComponents, TemplatesUiRecordSelectorFrameComponents } from "./components";
import { getTemplatesUiRecordSelectorFrameStyles } from "./styles";

/** The slots that fit a dataset control's parts into the frame. */
export interface IRecordSelectorFrameParts {
    header: Partial<IDatasetControlUiHeaderComponents>;
    quickFind: Partial<IDatasetControlUiQuickFindComponents>;
}

export interface ITemplatesUiRecordSelectorFrameProps {
    /** Handed the slots the dataset control's parts take. */
    children: (parts: IRecordSelectorFrameParts) => React.ReactNode;
    components?: Partial<ITemplatesUiRecordSelectorFrameComponents>;
}

/** The fixed-size box a record selector's search, list and paging are drawn in. */
export const TemplatesUiRecordSelectorFrame = (props: ITemplatesUiRecordSelectorFrameProps) => {
    const components = { ...TemplatesUiRecordSelectorFrameComponents, ...props.components };
    const styles = useMemo(() => getTemplatesUiRecordSelectorFrameStyles(), []);
    const parts = useMemo((): IRecordSelectorFrameParts => ({
        header: { onRender: containerProps => <WrapCompactProvider {...containerProps} className={getClassNames([containerProps.className, styles.header])} /> },
        quickFind: { onRender: containerProps => <div {...containerProps} className={getClassNames([containerProps.className, styles.quickFind])} /> },
    }), [styles]);

    return components.onRender({ className: styles.root, children: props.children(parts) });
};
