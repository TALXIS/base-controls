import { components } from "@components/DatasetControl/EditColumns/components";
import { ICommandBarItemProps, ICommandBarProps } from "@legacy";
import * as React from 'react';
import { useTaskGridEditColumns } from "../useTaskGridEditColumns";
import { useLocalizationService } from "@components/TaskGrid/context";


export const CommandBar = (props: ICommandBarProps) => {
    const localizationService = useLocalizationService();
    const { ...rest } = props;
    const { onCreateColumn } = useTaskGridEditColumns();

    const items = [
        ...props.items,
        ...(true ? [{
            key: 'add_custom_column',
            text: localizationService.getLocalizedString('addCustomColumn'),
            iconProps: { iconName: 'Add' },
            onClick: (e) => onCreateColumn()
        } as ICommandBarItemProps] : [])
    ] as ICommandBarItemProps[];

    return <components.CommandBar {...rest as any} items={items as any} />
}