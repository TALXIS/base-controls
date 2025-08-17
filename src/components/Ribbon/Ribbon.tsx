import { CommandBar, ICommandBarItemProps, useRerender } from "@talxis/react-components";
import { useControl } from "../../hooks"
import { IRibbon } from "./interfaces"
import { useMemo } from "react";
import { getRibbonStyles } from "./styles";
import { ICommand } from "@talxis/client-libraries";
import { Shimmer } from "@fluentui/react";

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
    const { className } = useControl('Ribbon', props, {});
    const isDisabled = props.context.mode.isControlDisabled;
    const commands = props.parameters.Commands?.raw ?? [];
    const isLoading = props.parameters.Loading?.raw ?? false;
    const styles = useMemo(() => getRibbonStyles(), []);
    const pendingActionsSet = useMemo(() => new Set<string>(), []);
    const rerender = useRerender();
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);
    const componentProps = onOverrideComponentProps({
        onRenderCommandBar: (props, defaultRender) => defaultRender(props),
        onRenderLoading: (props, defaultRender) => defaultRender(props)
    })

    const onCommandClick = async (command: ICommand) => {
        pendingActionsSet.add(command.commandId);
        rerender();
        try {
            await command.execute();
        }
        catch (err) {
            console.error(err);
        }
        finally {
            pendingActionsSet.delete(command.commandId);
            rerender();
        }
    }

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
                disabled: !command.canExecute || pendingActionsSet.has(command.commandId) || isDisabled,
                ["data-id"]: command?.commandButtonId,
                ["data-command"]: command?.commandId,
                title: command?.tooltip,
                iconProps: {
                    iconName: iconName
                },
                onClick: () => { onCommandClick(command) },
                //TODO: svg support
                //onRenderIcon: iconName?.includes('svg') ? () => <Icon name={iconName} /> : undefined,
            })
        })
        return result;
    }

    if (isLoading) {
        return componentProps.onRenderLoading({
            styles: {
                root: styles.shimmerRoot,
                shimmerWrapper: styles.shimmerWrapper
            }
        }, (props) => {
            return <Shimmer {...props} />
        })
    }
    else {
        return componentProps.onRenderCommandBar({
            className: styles.ribbonRoot,
            items: getCommandBarItems(),
        }, (props) => {
            return <CommandBar {...props} />
        })
    }

}