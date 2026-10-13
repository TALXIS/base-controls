import { useEffect, useMemo, useRef } from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { ErrorBoundary, getClassNames } from "@utils";
import { Shimmer } from "@ui/shimmer";
import { ILoadingBoundaryComponents, LoadingBoundary } from "@ui/loading-boundary";
import { IRibbonCommand } from "./interfaces";
import { IRibbonRuntime, IRibbonRuntimeEvents, RibbonRuntime } from "./RibbonRuntime";
import { IRibbonComponents } from "./components";
import { getRibbonStyles } from "./styles";
import { RibbonUi } from "./ui";

//as wide as the skeleton's ribbon pill
const SHIMMER_WIDTH = 208;

export interface IRibbonProps {
    /** Called at mount and on every `reload()`. */
    onLoad: () => Promise<IRibbonCommand[]>;
    /** Disables every command, such as while the data behind them loads. */
    disabled?: boolean;
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    /** Put on the ribbon's box, and on the shimmer while loading. */
    className?: string;
    /** Called with the runtime once it exists, before the first load. */
    onReady?: (ribbon: IRibbonRuntime) => void;
    components?: IRibbonComponents;
}

/** A command bar of the commands `onLoad` returns, each run when clicked. */
export const Ribbon = (props: IRibbonProps) => {
    const propsRef = useRef(props);
    propsRef.current = props;
    const runtime = useMemo(() => new RibbonRuntime({ onLoad: () => propsRef.current.onLoad() }), []);
    const styles = useMemo(() => getRibbonStyles(props.align ?? 'start'), [props.align]);
    const { rerender } = useRerender();
    const { loadingBoundary, errorMessage, ...commandBar } = props.components ?? {};

    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, ['onBeforeLoad', 'onLoaded', 'onBeforeExecute', 'onAfterExecute'], rerender);

    useEffect(() => {
        propsRef.current.onReady?.(runtime);
        runtime.reload();
        return () => runtime.destroy();
    }, []);

    const loadingBoundaryComponents: Partial<ILoadingBoundaryComponents> = {
        onRenderContainer: () => <Shimmer width={SHIMMER_WIDTH} className={getClassNames([styles.shimmer, props.className])} styles={{ shimmerWrapper: styles.shimmerWrapper }} />,
        ...loadingBoundary,
    };

    const commands = runtime.getCommands();
    const items = (commands ?? []).map((command): ICommandBarItemProps => ({
        key: command.id,
        text: command.label,
        title: command.tooltip,
        iconProps: command.iconName ? { iconName: command.iconName } : undefined,
        disabled: command.isDisabled || props.disabled || runtime.isRunning(command.id),
        onClick: () => { runtime.execute(command); },
    }));

    return <ErrorBoundary error={runtime.getError()} onRetry={() => runtime.reload()} components={errorMessage}>
        <LoadingBoundary isLoading={commands === undefined} components={loadingBoundaryComponents}>
            <RibbonUi items={items} align={props.align} className={props.className} components={commandBar} />
        </LoadingBoundary>
    </ErrorBoundary>;
};
