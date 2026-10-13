import { useEffect, useMemo, useRef } from "react";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { getClassNames, useDataProvider } from "@utils";
import { IRibbonProps, IRibbonRuntime, Ribbon as SharedRibbon } from "@controls/ribbon";
import { useRequiredDatasetControlRuntime } from "../root";
import { useDatasetControlRegion } from "../region";
import { getDatasetControlRibbonStyles } from "./styles";

/** Props for `DatasetControl.Ribbon`; reach the ribbon through `control.parts.get('ribbon')`. */
export type IDatasetControlRibbonProps = Omit<IRibbonProps, 'onReady' | 'align'>;

/** The ribbon, loaded again whenever the selected records change; in an `End` region its commands sit against the right. */
export const Ribbon = (props: IDatasetControlRibbonProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProvider();
    const styles = useMemo(() => getDatasetControlRibbonStyles(), []);
    const ribbonRef = useRef<IRibbonRuntime>();
    const region = useDatasetControlRegion();

    useEventEmitter<IDataProviderEventListeners>(provider, 'onRecordsSelected', () => ribbonRef.current?.reload());

    useEffect(() => () => {
        if (runtime.services.find('ribbon') === ribbonRef.current) {
            runtime.services.unregister('ribbon');
        }
    }, []);

    const onReady = (ribbon: IRibbonRuntime) => {
        ribbonRef.current = ribbon;
        runtime.services.register('ribbon', () => ribbon);
    };

    return <SharedRibbon {...props} align={region === 'end' ? 'end' : 'start'} className={getClassNames([styles.datasetControlRibbon, props.className])} onReady={onReady} />;
};
