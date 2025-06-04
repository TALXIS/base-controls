import { CommandBar, ICommandBarItemProps, ITheme, useRerender, useResizeObserver, useThemeGenerator, withButtonLoading } from "@talxis/react-components";
import { useComponentProps } from "../useComponentProps";
import { IRecordCommandsProps } from "../interfaces";
import { Icon } from "./Icon";
import { ICommandBar, PartialTheme, ThemeProvider } from "@fluentui/react";
import { useEffect, useMemo, useRef } from "react";
import { getRecordCommandsStyles } from "./styles";
import { IColumn, ICommand } from "@talxis/client-libraries";

interface IRecordCommands {
    commands: ICommand[];
    theme: ITheme;
    applicationTheme: ITheme;
    alignment: Required<IColumn['alignment']>;
    themeOverride?: PartialTheme;
}

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

export const RecordCommands = (props: IRecordCommands) => {
    const commands = props.commands;
    const commandBarRef = useRef<ICommandBar>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const styles = useMemo(() => getRecordCommandsStyles(props.alignment), [props.alignment])
    const theme = useThemeGenerator(props.theme.semanticColors.bodyText, props.theme.semanticColors.bodyBackground, props.theme.semanticColors.bodyText, props.themeOverride);
    const contextualMenuTheme = useThemeGenerator(props.applicationTheme.semanticColors.bodyText, props.applicationTheme.semanticColors.bodyBackground, props.applicationTheme.semanticColors.bodyText, props.themeOverride);
    const pendingActionsSet = useRef<Set<string>>(new Set());
    const rerender = useRerender();

    const observe = useResizeObserver(() => {
        commandBarRef.current?.remeasure();
    });

    const getCommandBarItems = (commands: ICommand[]): ICommandBarItemProps[] => {
        const result: ICommandBarItemProps[] = [];
        commands.map(command => {
            //@ts-ignore - portal internal types
            if (!command.shouldBeVisible || (command.__isInline !== undefined && command.__isInline === false)) {
                return;
            }
            let iconName = command.icon;
            if (fluentIconMap[iconName]) {
                iconName = fluentIconMap[iconName];
            }
            result.push({
                key: command.commandId,
                text: command.label,
                disabled: !command.canExecute || pendingActionsSet.current.has(command.commandId),
                ["data-id"]: command?.commandButtonId,
                ["data-command"]: command?.commandId,
                title: command?.tooltip,
                iconProps: {
                    iconName: iconName
                },
                onClick: () => {
                    (async () => {
                        pendingActionsSet.current.add(command.commandId);
                        rerender();
                        try {
                            await command.execute();
                        }
                        catch (err) {
                            console.error(err);
                        }
                        finally {
                            pendingActionsSet.current.delete(command.commandId);
                            rerender();
                        }
                    })();
                },
                onRenderIcon: iconName?.includes('svg') ? () => <Icon name={iconName} /> : undefined,
            })
        })
        return result;
    }

    const getComponentProps = (): IRecordCommandsProps => {
        return {
            containerProps: {
                theme: theme,
                ref: containerRef,
                className: styles.recordCommandsContainer
            },
            commandBarProps: {
                componentRef: commandBarRef,
                className: styles.recordCommandsRoot,
                contextualMenuTheme: contextualMenuTheme,
                styles: {
                    primarySet: styles.recordCommandsPrimarySet
                },
                items: getCommandBarItems(commands)
            }
        }
    }

    const componentProps = useComponentProps().onGetRecordCommandsProps(getComponentProps());

    useEffect(() => {
        observe(containerRef.current!);
    }, []);

    return <ThemeProvider {...componentProps.containerProps}><CommandBar {...componentProps.commandBarProps} /></ThemeProvider>
}