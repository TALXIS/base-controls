import { useState, useEffect } from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { Icon } from './Icon';
import React from "react";
import { commandStyles } from "./styles";
import { useGridInstance } from "../../../hooks/useGridInstance";

export const useCommands = (record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord): [
    ICommandBarItemProps[] | null
] => {
    const grid = useGridInstance();
    const dataset = grid.dataset;
    console.log('rendering ribbon')
    const [commandBarItems, setCommandBarItems] = useState<ICommandBarItemProps[] | null>(null);
    useEffect(() => {
        (async () => {
            setCommandBarItems(await getCommandBarItems());
        })();
    }, []);

    const getCommandBarItems = async () => {
        const items: ICommandBarItemProps[] = [];
        if(!dataset.retrieveRecordCommand) {
            return []
        }
        const commands = await dataset.retrieveRecordCommand([record.getRecordId()], grid.inlineRibbonButtonIds);
        for (const command of commands) {
            if (!command.shouldBeVisible /* || (command.__isInline !== undefined && command.__isInline === false */) {
                continue;
            }
            items.push({
                key: command.commandButtonId,
                text: command.label,
                ["data-id"]: command.commandButtonId,
                ["data-command"]: command.commandId,
                buttonStyles: {
                    root: commandStyles.button,
                    rootHovered: commandStyles.button,
                    rootPressed: commandStyles.button,
                },
                onClick: (e) => {
                    e?.stopPropagation();
                    command.execute();
                },
                onRenderIcon: command.icon?.includes('.svg') ? () => <Icon name={command.icon} /> : undefined,
                iconProps: command.icon ? {
                    iconName: command.icon
                } : undefined
            });
        }
        return items;
    };
    return [commandBarItems];
};