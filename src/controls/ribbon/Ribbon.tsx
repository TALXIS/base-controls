import { ICommandBarItemProps } from "@fluentui/react";
import { useEventEmitter, useLatest, useRerender, ErrorHelper } from "@core";
import { usePcfContext } from "@pcf";
import { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import { RuntimeHost, useRuntime } from "@controls/runtime-host";
import { IRibbonCommand } from "./interfaces";
import { IRibbonRuntime, IRibbonRuntimeEvents, RibbonRuntime } from "./runtime/RibbonRuntime";
import { IRibbonComponents } from "./components";
import { RibbonShimmerUi, RibbonUi } from "./ui";

export interface IRibbonProps {
    /** Called on init and on every `reload()`, and may return the commands directly; the ones `registerCommands` adds follow. */
    onLoad?: (ribbon: IRibbonRuntime) => IRibbonCommand[] | Promise<IRibbonCommand[]>;
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    /** Put on the ribbon's box, and on the shimmer while it initializes. */
    className?: string;
    /** Disables every command, menus included. */
    disabled?: boolean;
    /** Called with the runtime of each mount, before its init; register commands and subscribe here. */
    onSetup?: (ribbon: IRibbonRuntime) => void;
    /** Replacements for the command bar, the shimmer and the error. */
    components?: IRibbonComponents;
}

/** A command bar of the commands `onLoad` returns: actions run when clicked, menus open. */
export const Ribbon = (props: IRibbonProps) => {
    const propsRef = useLatest(props);
    const onCreate = () => new RibbonRuntime({ onLoad: propsRef.current.onLoad && (ribbon => propsRef.current.onLoad!(ribbon)) });

    const loadingBoundary: Partial<ILoadingBoundaryComponents> = {
        onRenderContainer: () => <RibbonShimmerUi align={props.align} className={props.className} components={props.components?.shimmer} />,
    };

    return <RuntimeHost<RibbonRuntime> onCreate={onCreate} onSetup={ribbon => propsRef.current.onSetup?.(ribbon)} components={{ errorMessage: props.components?.errorMessage, loadingBoundary }}>
        <RibbonMount {...props} />
    </RuntimeHost>;
};

/** One mount of the ribbon: its commands, on a ready runtime. */
const RibbonMount = (props: IRibbonProps) => {
    const runtime = useRuntime<RibbonRuntime>();
    const { rerender } = useRerender();
    const pcfContext = usePcfContext();
    const { errorMessage, shimmer, ...commandBar } = props.components ?? {};

    const openErrorDialog = (error: unknown) => {
        pcfContext.navigation.openErrorDialog({ message: ErrorHelper.getMessageFromError(error), details: (error as { stack?: string } | undefined)?.stack });
    };

    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, ['onCommandsChanged', 'onBeforeExecute', 'onAfterExecute'], rerender);
    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, 'onExecuteFailed', (_command, error) => openErrorDialog(error));
    useEventEmitter<IRibbonRuntimeEvents>(runtime.events, 'onReloadFailed', openErrorDialog);

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

    return <RibbonUi items={(runtime.getCommands() ?? []).map(toItem)} align={props.align} className={props.className} components={commandBar} />;
};
