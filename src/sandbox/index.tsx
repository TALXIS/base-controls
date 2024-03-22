import { initializeIcons, Label, PrimaryButton, TextField } from '@fluentui/react';
import React, { useState } from 'react';
import { SingleLineText } from '../components/SingleLineText/SingleLineText';
import { Formatting } from './mock/Formatting';
import { Mode } from './mock/Mode';
import { UserSettings } from './mock/UserSettings';

initializeIcons();

export const Sandbox: React.FC = () => {
    const [value, setValue] = useState<string>();
    const [isMounted, setIsMounted] = useState<boolean>(true);

    return (
        <>
            <Label>Outside change</Label>
            <TextField value={value} onChange={(e, value) => setValue(value)} />
            {isMounted &&
                <>
                    <Label>Component</Label>
                    <SingleLineText
                        mode={new Mode()}
                        EnableDeleteButton={{
                            raw: true,
                        }}
                        formatting={new Formatting()}
                        userSettings={new UserSettings()}
                        onNotifyOutputChanged={(outputs) => {
                            console.log('triggered');
                            setValue(outputs.value as string);
                        }}
                        inputs={{
                            value: {
                                raw: value ?? null,
                            }
                        }} />
                </>
            }
            <PrimaryButton text='Mount/Unmount component' onClick={() => setIsMounted(!isMounted)} />
        </>
    )
}