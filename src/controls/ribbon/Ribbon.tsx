import { useEffect, useMemo } from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { useEventEmitter, useLatest } from "@hooks";
import { useRerender } from "@legacy";
import { ErrorBoundary, ErrorHelper, getClassNames, usePcfContext } from "@utils";
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
    /** Called at mount and on every `reload()`; the commands registered through `registerCommands` follow. */
    onLoad?: () => Promise<IRibbonCommand[]>;
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    /** Put on the ribbon's box, and on the shimmer while loading. */
    className?: string;
    /** Called with the runtime once it exists, before the first load. */
    onReady?: (ribbon: IRibbonRuntime) => void;
    /** Replacements for the command bar, the shimmer and the error. */
    components?: IRibbonComponents;
}

/** A command bar of the commands `onLoad` returns: actions run when clicked, menus open. */
export const Ribbon = (props: IRibbonProps) => {
    const propsRef = useLatest(props);
    const runtime = useMemo(() => new RibbonRuntime({ onLoad: propsRef.current.onLoad && (() => propsRef.current.onLoad!()) }), []);
    const styles = useMemo(() => getRibbonStyles(props.align ?? 'start'), [props.align]);
    const { rerender } = useRerender();
    const pcfContext = usePcfContext();
    const { loadingBoundary, errorMessage, ...commandBar } = props.components ?? {};

    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, ['onBeforeLoad', 'onLoaded', 'onBeforeExecute', 'onAfterExecute'], rerender);
    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, 'onExecuteFailed', (_command, error) => {
        pcfContext.navigation.openErrorDialog({ message: ErrorHelper.getMessageFromError(error), details: error instanceof Error ? error.stack : undefined });
    });

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
    const toItem = (command: IRibbonCommand): ICommandBarItemProps => {
        const item: ICommandBarItemProps = {
            key: command.id,
            text: command.label,
            title: command.tooltip,
            iconProps: command.iconName ? { iconName: command.iconName } : undefined,
        };
        if (command.commands) {
            return { ...item, disabled: command.isDisabled, subMenuProps: { items: command.commands.map(toItem) } };
        }
        return { ...item, disabled: command.isDisabled || runtime.isRunning(command.id), onClick: () => { runtime.execute(command); } };
    };

    const items = (commands ?? []).map(toItem);

    return <ErrorBoundary error={runtime.getError()} onRetry={() => runtime.reload()} components={errorMessage}>
        <LoadingBoundary isLoading={commands === undefined} components={loadingBoundaryComponents}>
            <RibbonUi items={items} align={props.align} className={props.className} components={commandBar} />
        </LoadingBoundary>
    </ErrorBoundary>;
};
