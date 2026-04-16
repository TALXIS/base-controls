import { components } from "../../../../../DatasetControl/EditColumns/components";
import { ICommandBarItemProps, ICommandBarProps } from "@talxis/react-components";
import * as React from 'react';
import { useTaskGridEditColumns } from "../useTaskGridEditColumns";
import { useLocalizationService } from "../../../../context";


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