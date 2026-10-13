import { useMemo, useRef } from "react";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { getClassNames, useDataProvider } from "@utils";
import { IRibbonProps, IRibbonRuntime, Ribbon as SharedRibbon } from "@controls/ribbon";
import { useDatasetControlRegion } from "../region";
import { getDatasetControlRibbonStyles } from "./styles";

/** Props for `DatasetControl.Ribbon`, the shared `Ribbon`'s own. */
export type IDatasetControlRibbonProps = IRibbonProps;

/** The ribbon, loaded again whenever the selected records change; in an `End` region its commands sit against the right. */
export const Ribbon = (props: IDatasetControlRibbonProps) => {
    const provider = useDataProvider();
    const styles = useMemo(() => getDatasetControlRibbonStyles(), []);
    const ribbonRef = useRef<IRibbonRuntime>();
    const region = useDatasetControlRegion();

    useEventEmitter<IDataProviderEventListeners>(provider, 'onRecordsSelected', () => ribbonRef.current?.reload());

    const onReady = (ribbon: IRibbonRuntime) => {
        ribbonRef.current = ribbon;
        props.onReady?.(ribbon);
    };

    return <SharedRibbon align={region === 'end' ? 'end' : 'start'} {...props} className={getClassNames([styles.datasetControlRibbon, props.className])} onReady={onReady} />;
};
