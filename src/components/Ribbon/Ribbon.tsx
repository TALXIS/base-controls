import { CommandBar, getClassNames, ICommandBarItemProps, useRerender } from "@talxis/react-components";
import { useControl } from "../../hooks"
import { IRibbon } from "./interfaces"
import { useMemo, useRef } from "react";
import { getRibbonStyles } from "./styles";
import { getIcon, Shimmer, ThemeProvider } from "@fluentui/react";
import { IRibbonModelEvents, RibbonModel } from "./RibbonModel";
import { useEventEmitter } from "../../hooks/useEventEmitter";

const fluentIconMap: { [key: string]: string } = {
    'Activate': 'ActivateOrders',
    'DeActivate': 'DeactivateOrders',
    'ExportToExcel': 'ExcelDocument',
    'ConnectionToOther': 'Assign',
    'EmailLink': 'Link',
    'Flows': 'Dataflows',
    'RunReport': 'CRMReport',
    'Report': 'CRMReport',
    'Remove': 'Delete',
    'WordTemplates': 'WordDocument',
    'DocumentTemplates': 'ExcelDocument',
    'New': 'Add',
}

export const Ribbon = (props: IRibbon) => {
    const { theme, className } = useControl('Ribbon', props, {});
    const propsRef = useRef<IRibbon>(props);
    propsRef.current = props;
    const model = useMemo(() => new RibbonModel(() => propsRef.current), [])
    const commands = props.parameters.Commands?.raw ?? [];
    const styles = useMemo(() => getRibbonStyles(), []);
    const rerender = useRerender();
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    useEventEmitter<IRibbonModelEvents>(model, ['onBeforeCommandExecuted', 'onCommandExecutionFinished'], () => rerender())
    const componentProps = onOverrideComponentProps({
        onRender: (props, defaultRender) => defaultRender(props),
    })

    const getIconName = (iconName?: string): string | undefined => {
        const iconType = model.getIconType(iconName);
        switch (iconType) {
            case 'none': {
                return undefined;
            }
            case 'url': {
                return iconName;
            }
            case 'fluent': {
                if (fluentIconMap[iconName!]) {
                    return fluentIconMap[iconName!];
                }
                if (getIcon(iconName)) {
                    return iconName!;
                }
                return 'Puzzle';
            }
        }
    }

    const getCommandBarItems = (): ICommandBarItemProps[] => {
        const result: ICommandBarItemProps[] = [];
        commands.map(command => {
            if (!command.shouldBeVisible) {
                return;
            }
            const iconName = getIconName(command.icon);
            const iconUrl = model.getIconUrl(iconName);
            result.push({
                key: command.commandId,
                text: command.label,
                disabled: model.isCommandDisabled(command),
                className: styles.commandBtnRoot,
                ["data-id"]: command?.commandButtonId,
                ["data-command"]: command?.commandId,
                title: command?.tooltip,
                iconProps: iconName !== null ? {
                    iconName: !iconUrl ? iconName : undefined,
                    imageProps: iconUrl ? {
                        src: iconUrl
                    } : undefined
                } : undefined,
                onClick: () => { model.executeCommand(command) }
            })
        })
        return result;
    }

    return componentProps.onRender({
        container: {
            theme: theme,
            className: getClassNames([className, styles.container])
        },
        isLoading: model.isLoading(),
        onRenderCommandBar: (props, defaultRender) => defaultRender(props),
        onRenderLoading: (props, defaultRender) => defaultRender(props)
    }, (props) => {
        return <ThemeProvider {...props.container}>
            {(() => {
                if (props.isLoading) {
                    return props.onRenderLoading({
                        styles: {
                            root: styles.shimmerRoot,
                            shimmerWrapper: styles.shimmerWrapper
                        }
                    }, (props) => {
                        return <Shimmer {...props} />
                    })
                }
                else {
                    return props.onRenderCommandBar({
                        theme: theme,
                        items: getCommandBarItems(),
                        contextualMenuTheme: propsRef.current.context.fluentDesignLanguage?.applicationTheme ?? theme
                    }, (props) => {
                        return <CommandBar {...props} />
                    })
                }
            })()}
        </ThemeProvider>
    })

}