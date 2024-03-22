import { initializeIcons, Label, PrimaryButton} from '@fluentui/react';
import { TextField } from '@talxis/react-components/dist/components/TextField';
import React, { useState } from 'react';
import { SingleLineText } from '../components/SingleLineText/SingleLineText';
import { Context } from './mock/Context';
import { Formatting } from './mock/Formatting';
import { Mode } from './mock/Mode';
import { UserSettings } from './mock/UserSettings';

initializeIcons();

export const Sandbox: React.FC = () => {
    const [value, setValue] = useState<string>();
    const [isMounted, setIsMounted] = useState<boolean>(true);
    const [test, setTest] = useState('test');

    return (
        <>
            <Label>Outside change</Label>
            <TextField value={value} onChange={(e, value) => setValue(value)} />
            {isMounted &&
                <>
                    <Label>Component</Label>
                    <SingleLineText
                        context={new Context()}
                        onNotifyOutputChanged={(outputs) => {
                            setValue(outputs.value as string);
                        }}
                        bindings={{
                            EnableDeleteButton: {
                                raw: true,
                            },
                            value: {
                                raw: value ?? null,
                            }
                        }} />
                </>
            }
            <br />
            <PrimaryButton text='Mount/Unmount component' onClick={() => setIsMounted(!isMounted)} />
            <br />
            <br />
            <PrimaryButton text='Trigger rerender' onClick={() => setTest(Math.random().toString()) }/>
        </>
    )
}