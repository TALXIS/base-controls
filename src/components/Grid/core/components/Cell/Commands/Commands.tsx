import * as React from 'react';
import { useCommands } from './useCommands';
import { CommandBar } from "@talxis/react-components";
import { commandStyles, getCommandsLoadingStyles } from './styles';
import { useTheme } from '@fluentui/react';
import { IRecord } from '@talxis/client-libraries';

interface ICommands {
    record: IRecord
}

export const Commands = ({ record }: ICommands) => {
    const [items] = useCommands(record);
    const loadingStyles = getCommandsLoadingStyles(useTheme());
    if (!items) {
        return <div className={loadingStyles.loading}>
            {Array.from(Array(3).keys()).map((x) =>
                <div key={x} className={loadingStyles.loadingLine} />
            )}
        </div>
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
            farItems={items}
        />;
    }
    return <></>;
};