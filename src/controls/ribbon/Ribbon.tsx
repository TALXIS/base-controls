import { useMemo } from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { useEventEmitter, useLatest, useRerender, ErrorHelper, getClassNames } from "@core";
import { usePcfContext } from "@pcf";
import { Shimmer } from "@ui/shimmer";
import { ILoadingBoundaryComponents, LoadingBoundary } from "@ui/loading-boundary";
import { RuntimeHost, useRuntime } from "@controls/runtime-host";
import { IRibbonCommand } from "./interfaces";
import { IRibbonRuntime, IRibbonRuntimeEvents, RibbonRuntime } from "./runtime/RibbonRuntime";
import { IRibbonComponents } from "./components";
import { getRibbonStyles } from "./styles";
import { RibbonUi } from "./ui";

//as wide as the skeleton's ribbon pill
const SHIMMER_WIDTH = 208;

export interface IRibbonProps {
    /** Called on init and on every `reload()`; the commands registered through `registerCommands` follow. */
    onLoad?: () => Promise<IRibbonCommand[]>;
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    /** Put on the ribbon's box, and on the shimmer while it initializes. */
    className?: string;
    /** Disables every command, menus included. */
    disabled?: boolean;
    /** Called with the runtime of each mount, before its init; register commands and subscribe here. */
    onMounted?: (ribbon: IRibbonRuntime) => void;
    /** Replacements for the command bar, the shimmer and the error. */
    components?: IRibbonComponents;
}

/** A command bar of the commands `onLoad` returns: actions run when clicked, menus open. */
export const Ribbon = (props: IRibbonProps) => {
    const propsRef = useLatest(props);
    const onCreate = () => new RibbonRuntime({ onLoad: propsRef.current.onLoad && (() => propsRef.current.onLoad!()) });

    return <RuntimeHost<RibbonRuntime> onCreate={onCreate} onMounted={ribbon => propsRef.current.onMounted?.(ribbon)} components={{ errorMessage: props.components?.errorMessage }}>
        <RibbonMount {...props} />
    </RuntimeHost>;
};

/** One mount of the ribbon: its commands, or the shimmer while it initializes. */
const RibbonMount = (props: IRibbonProps) => {
    const runtime = useRuntime<RibbonRuntime>();
    const styles = useMemo(() => getRibbonStyles(props.align ?? 'start'), [props.align]);
    const { rerender } = useRerender();
    const pcfContext = usePcfContext();
    const { loadingBoundary, errorMessage, ...commandBar } = props.components ?? {};

    const openErrorDialog = (error: unknown) => {
        pcfContext.navigation.openErrorDialog({ message: ErrorHelper.getMessageFromError(error), details: (error as { stack?: string } | undefined)?.stack });
    };

    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, ['onCommandsChanged', 'onBeforeExecute', 'onAfterExecute'], rerender);
    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, 'onExecuteFailed', (_command, error) => openErrorDialog(error));
    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, 'onReloadFailed', openErrorDialog);

    const loadingBoundaryComponents: Partial<ILoadingBoundaryComponents> = {
        onRenderContainer: () => <Shimmer width={SHIMMER_WIDTH} className={getClassNames([styles.shimmer, props.className])} styles={{ shimmerWrapper: styles.shimmerWrapper }} />,
        ...loadingBoundary,
    };

    const toItem = (command: IRibbonCommand): ICommandBarItemProps => {
        const item: ICommandBarItemProps = {
            key: command.id,
            text: command.label,
            title: command.tooltip,
            iconProps: command.iconName ? { iconName: command.iconName } : undefined,
        };
        if (command.commands) {
            return { ...item, disabled: props.disabled || command.isDisabled, subMenuProps: { items: command.commands.map(toItem) } };
        }
        return { ...item, disabled: props.disabled || command.isDisabled || runtime.isRunning(command.id), onClick: () => { runtime.execute(command); } };
    };

    return <LoadingBoundary isLoading={runtime.lifecycle.getStatus() === 'initializing'} components={loadingBoundaryComponents}>
        <RibbonUi items={(runtime.getCommands() ?? []).map(toItem)} align={props.align} className={props.className} components={commandBar} />
    </LoadingBoundary>;
};
