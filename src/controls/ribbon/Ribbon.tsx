import { ICommandBarItemProps } from "@fluentui/react";
import { useEventEmitter, useLatest, useRerender } from "@core";
import { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import { RuntimeHost, useRuntime } from "@controls/runtime-host";
import { IRibbonCommand } from "./interfaces";
import { IRibbon, IRibbonEvents, RibbonRuntime } from "./runtime/RibbonRuntime";
import { IRibbonComponents } from "./components";
import { RibbonUiShimmer, RibbonUiCommandBar } from "./ui";
import { Ribbon } from "./namespace";

export interface IRibbonProps {
    /** Called on init and on every `reload()`, and may return the commands directly; the ones `hooks.commands` adds follow. */
    onLoad?: (ribbon: IRibbon) => IRibbonCommand[] | Promise<IRibbonCommand[]>;
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    /** Put on the ribbon's box. */
    className?: string;
    /** Disables every command, menus included. */
    disabled?: boolean;
    /** Called with the runtime of each mount, before its init; add hooks and subscribe here. */
    onSetup?: (ribbon: IRibbon) => void;
    /** Replacements for the command bar, the shimmer and the error. */
    components?: IRibbonComponents;
}

/** A command bar of the commands `onLoad` returns: actions run when clicked, menus open. */
export const RibbonRoot = (props: IRibbonProps) => {
    const propsRef = useLatest(props);
    const createRuntime = () => new RibbonRuntime({ onLoad: propsRef.current.onLoad && (ribbon => propsRef.current.onLoad!(ribbon)) });

    const loading: Partial<ILoadingBoundaryComponents> = {
        onRenderContainer: () => <RibbonUiShimmer align={props.align} components={props.components?.shimmer} />,
    };

    return <RuntimeHost<RibbonRuntime> createRuntime={createRuntime} onSetup={ribbon => propsRef.current.onSetup?.(ribbon)} className={props.className} components={{ mountError: props.components?.errorMessage, placeholder: loading }}>
        <RibbonMount {...props} />
    </RuntimeHost>;
};

/** One mount of the ribbon: its commands, on a ready runtime. */
const RibbonMount = (props: IRibbonProps) => {
    const runtime = useRuntime<RibbonRuntime>();
    const { rerender } = useRerender();
    const { errorMessage, shimmer, ...commandBar } = props.components ?? {};

    useEventEmitter<IRibbonEvents>(runtime.events, ['onCommandsChanged', 'onBeforeExecute', 'onAfterExecute'], rerender);

    const toItem = (command: IRibbonCommand): ICommandBarItemProps => {
        const item: ICommandBarItemProps = {
            key: command.id,
            text: command.label,
            title: command.tooltip,
            iconProps: command.iconName ? { iconName: command.iconName } : undefined,
        };
        if (command.commands) {
            return { ...item, disabled: props.disabled || command.disabled, subMenuProps: { items: command.commands.map(toItem) } };
        }
        return { ...item, disabled: props.disabled || command.disabled || runtime.isRunning(command.id), onClick: () => { runtime.executeCommand(command); } };
    };

    return <RibbonUiCommandBar items={(runtime.getCommands() ?? []).map(toItem)} align={props.align} components={commandBar} />;
};
