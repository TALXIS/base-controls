import * as React from 'react';
import { useCommands } from './useCommands';
import { CommandBar } from '@talxis/react-components/dist/components/CommandBar';
import { commandStyles } from './styles';
import { CommandBarButton } from '@fluentui/react';

interface ICommands {
    record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
}

export const Commands = ({ record }: ICommands) => {
    const [items] = useCommands(record);
    if (!items) {
        return <></>
    }
    if (items?.length > 0) {
        return <CommandBar className={commandStyles.talxisRoot} overflowButtonProps={{
            styles: {
                root: commandStyles.button,
                rootHovered: commandStyles.button,
                rootPressed: commandStyles.button,
                rootExpanded: commandStyles.button
            }
        }} styles={{
            root: commandStyles.root,

        }} items={[]}
        farItems={items} />;
    }
    return <></>;
};