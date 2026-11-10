import { Fragment, useRef, useState } from "react";
import { IRuntime, IRuntimeExecutorEvents, useEventEmitter } from "@core";
import { useLabels } from "@labels";
import { IRuntimeExecuteErrorComponents, RuntimeExecuteErrorComponents } from "./components";
import { RUNTIME_EXECUTE_ERROR_LABELS } from "./labels";
import { useRuntime } from "../../context";

export interface IRuntimeExecuteErrorProps {
    components?: Partial<IRuntimeExecuteErrorComponents>;
}

interface IFailure {
    id: number;
    error: unknown;
    title?: string;
}

/** Shows the failures of `execute` one at a time, oldest first. */
export const RuntimeExecuteError = (props: IRuntimeExecuteErrorProps) => {
    const { executor } = useRuntime<IRuntime>();
    const components = { ...RuntimeExecuteErrorComponents, ...props.components };
    const labels = useLabels(RUNTIME_EXECUTE_ERROR_LABELS);
    const [failures, setFailures] = useState<IFailure[]>([]);
    const nextId = useRef(0);

    useEventEmitter<IRuntimeExecutorEvents>(executor.events, 'onExecuteFailed', (error, title) => {
        setFailures(failures => [...failures, { id: nextId.current++, error, title }]);
    });

    const [failure] = failures;
    if (!failure) {
        return null;
    }
    return <Fragment key={failure.id}>
        {components.onRenderError({
            title: failure.title ?? labels.get('runtimeExecuteError.title'),
            error: failure.error,
            onDismiss: () => setFailures(failures => failures.filter(other => other !== failure)),
        })}
    </Fragment>;
};
