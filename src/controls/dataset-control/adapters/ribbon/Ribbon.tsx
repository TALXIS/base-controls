import { useEffect, useMemo, useRef } from "react";
import { useLatest, getClassNames } from "@core";
import { useDataProviderEvents } from "@data";
import { IRibbonProps, IRibbonRuntime, Ribbon as SharedRibbon } from "@controls/ribbon";
import { useRequiredDatasetControlRuntime } from "../root";
import { useDatasetControlRegion } from "../region";
import { DatasetControlRibbonCommands } from "../../runtime/parts/ribbon/DatasetControlRibbonCommands";
import { getDatasetControlRibbonStyles } from "./styles";

/** Props for `DatasetControl.Ribbon`; reach the ribbon through `control.parts.get('ribbon')`. */
export interface IDatasetControlRibbonProps extends Omit<IRibbonProps, 'onReady' | 'align'> {
    /** Adds Refresh, which loads the records again; asks first when there are unsaved changes. */
    enableRefresh?: boolean;
    /** Adds Save while there are unsaved changes, which saves every changed record. */
    enableSave?: boolean;
    /** Adds Discard changes while there are unsaved changes, which undoes them all. */
    enableDiscard?: boolean;
}

/** The ribbon, loaded again whenever the selected records change; in an `End` region its commands sit against the right. */
export const Ribbon = (props: IDatasetControlRibbonProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    const provider = useDataProviderEvents(['onLoading']);
    const styles = useMemo(() => getDatasetControlRibbonStyles(), []);
    const ribbonRef = useRef<IRibbonRuntime>();
    const region = useDatasetControlRegion();
    const propsRef = useLatest(props);
    const commands = useMemo(() => new DatasetControlRibbonCommands({ provider, datasetControl: runtime, onGetProps: () => propsRef.current }), []);
    const { enableRefresh, enableSave, enableDiscard, ...ribbonProps } = props;

    useEffect(() => () => {
        commands.destroy();
        if (runtime.services.find('ribbon') === ribbonRef.current) {
            runtime.services.unregister('ribbon');
        }
    }, []);

    const onReady = (ribbon: IRibbonRuntime) => {
        ribbonRef.current = ribbon;
        commands.attach(ribbon);
        runtime.services.register('ribbon', () => ribbon);
    };

    return <SharedRibbon {...ribbonProps} disabled={props.disabled || provider.isLoading()} align={region === 'end' ? 'end' : 'start'} className={getClassNames([styles.datasetControlRibbon, props.className])} onReady={onReady} />;
};
