import { useState } from "react";
import { IRuntime, IRuntimeExecutorEvents, useEventEmitter } from "@core";
import { useLabels } from "@labels";
import { IRuntimeExecuteFailure } from "../../ui/error-dialog";
import { IRuntimeExecuteErrorComponents, RuntimeExecuteErrorComponents } from "./components";
import { RUNTIME_EXECUTE_ERROR_LABELS } from "./labels";
import { useRuntime } from "../../context";

export interface IRuntimeExecuteErrorProps {
    components?: Partial<IRuntimeExecuteErrorComponents>;
}

/** Keeps the failures of `execute` until they are dismissed. */
export const RuntimeExecuteError = (props: IRuntimeExecuteErrorProps) => {
    const { executor } = useRuntime<IRuntime>();
    const components = { ...RuntimeExecuteErrorComponents, ...props.components };
    const labels = useLabels(RUNTIME_EXECUTE_ERROR_LABELS);
    const [failures, setFailures] = useState<IRuntimeExecuteFailure[]>([]);

    useEventEmitter<IRuntimeExecutorEvents>(executor.events, 'onExecuteFailed', (error, title) => {
        setFailures(failures => [...failures, { title: title ?? labels.get('runtimeExecuteError.title'), error }]);
    });

    return components.onRender({
        failures,
        onDismiss: failure => setFailures(failures => failures.filter(other => other !== failure)),
    });
};
