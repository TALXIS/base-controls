import { ActionButton, DefaultButton, Stack, Text, ThemeProvider } from '@fluentui/react';
import React, { useState } from 'react';
import { useControl } from '../../hooks';
import { IFile, IFileOutputs } from './interfaces';

export const File = (props: IFile) => {
    const { sizing, onNotifyOutputChanged, theme } = useControl('File', props);
    const context = props.context;
    const parameters = props.parameters;
    const boundValue = parameters.value;
    const [isLoading, setIsLoading] = useState(false);

    const handlePickFile = async () => {
        setIsLoading(true);
        try {
            const files = await context.device.pickFile();
            if (files && files.length > 0) {
                onNotifyOutputChanged({ value: files[0] } as IFileOutputs);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        onNotifyOutputChanged({ value: undefined } as IFileOutputs);
    };

    return (
        <ThemeProvider theme={theme} applyTo='none'>
            <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                verticalAlign='center'
                styles={{
                    root: {
                        height: sizing.height,
                        width: sizing.width
                    }
                }}
            >
                {!context.mode.isControlDisabled && (
                    <DefaultButton
                        disabled={isLoading || parameters.ForceDisable?.raw === true}
                        onClick={handlePickFile}
                        iconProps={{ iconName: 'Attach' }}
                        text='Choose File'
                    />
                )}
                {boundValue.raw && (
                    <>
                        <Text>{boundValue.raw.fileName}</Text>
                        {!context.mode.isControlDisabled && (
                            <ActionButton
                                disabled={parameters.ForceDisable?.raw === true}
                                iconProps={{ iconName: 'Cancel' }}
                                onClick={handleClear}
                            />
                        )}
                    </>
                )}
            </Stack>
        </ThemeProvider>
    );
};
