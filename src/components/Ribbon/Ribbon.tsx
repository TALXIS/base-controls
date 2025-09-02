import { CommandBar, getClassNames, ICommandBarItemProps, useRerender } from "@talxis/react-components";
import { useControl } from "../../hooks"
import { IRibbon } from "./interfaces"
import { useMemo, useRef } from "react";
import { getRibbonStyles } from "./styles";
import { Shimmer, ThemeProvider } from "@fluentui/react";
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

    const getCommandBarItems = (): ICommandBarItemProps[] => {
        const result: ICommandBarItemProps[] = [];
        commands.map(command => {
            if (!command.shouldBeVisible) {
                return;
            }
            let iconName = command.icon;
            if (fluentIconMap[iconName]) {
                iconName = fluentIconMap[iconName];
            }
            result.push({
                key: command.commandId,
                text: command.label,
                disabled: model.isCommandDisabled(command),
                ["data-id"]: command?.commandButtonId,
                ["data-command"]: command?.commandId,
                title: command?.tooltip,
                iconProps: {
                    iconName: iconName
                },
                onClick: () => { model.executeCommand(command) },
                //TODO: svg support
                //onRenderIcon: iconName?.includes('svg') ? () => <Icon name={iconName} /> : undefined,
            })
        })
        return result;
    }

    return componentProps.onRender({
        container: {
            theme: theme,
            className: getClassNames([className, styles.container])
        },
        onRenderCommandBar: (props, defaultRender) => defaultRender(props),
        onRenderLoading: (props, defaultRender) => defaultRender(props)
    }, (props) => {
        return <ThemeProvider {...props.container}>
            {(() => {
                if (model.isLoading()) {
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
                    }, (props) => {
                        return <CommandBar {...props} />
                    })
                }
            })()}
        </ThemeProvider>
    })

}