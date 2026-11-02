import { useMemo } from "react";
import type { IHeaderUiComponents, IQuickFindUiComponents } from "@controls/dataset-control";
import { getClassNames, WrapCompactProvider } from "@utils";
import { IRecordSelectorFrameComponents, RecordSelectorFrameComponents } from "./components";
import { getRecordSelectorFrameStyles } from "./styles";

/** The slots that fit a dataset control's parts into the frame. */
export interface IRecordSelectorFrameParts {
    header: Partial<IHeaderUiComponents>;
    quickFind: Partial<IQuickFindUiComponents>;
}

export interface IRecordSelectorFrameProps {
    /** Handed the slots the dataset control's parts take. */
    children: (parts: IRecordSelectorFrameParts) => React.ReactNode;
    components?: Partial<IRecordSelectorFrameComponents>;
}

/** The fixed-size box a record selector's search, list and paging are drawn in. */
export const RecordSelectorFrame = (props: IRecordSelectorFrameProps) => {
    const components = { ...RecordSelectorFrameComponents, ...props.components };
    const styles = useMemo(() => getRecordSelectorFrameStyles(), []);
    const parts = useMemo((): IRecordSelectorFrameParts => ({
        header: { onRenderContainer: containerProps => <WrapCompactProvider {...containerProps} className={getClassNames([containerProps.className, styles.header])} /> },
        quickFind: { onRenderContainer: containerProps => <div {...containerProps} className={getClassNames([containerProps.className, styles.quickFind])} /> },
    }), [styles]);

    return components.onRenderContainer({ className: styles.root, children: props.children(parts) });
};
