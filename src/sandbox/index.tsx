import { initializeIcons, Label, PrimaryButton, TextFieldBase} from '@fluentui/react';
import { TextField as TalxisTextField } from '@talxis/react-components/dist/components/TextField';
import React, { useEffect, useState } from 'react';
import { DateTime } from '../components/DateTime';
import { TextField } from '../components/TextField/TextField';
import { Context } from './mock/Context';

initializeIcons();

export const Sandbox: React.FC = () => {
    const [value, setValue] = useState<string>();
    const [isMounted, setIsMounted] = useState<boolean>(true);
    const [test, setTest] = useState('');
    return (
        <>
            <Label>Outside change</Label>
            <TalxisTextField value={value} onChange={(e, value) => setValue(value)} />
            {isMounted &&
                <>
                    <Label>Component</Label>
                    <TextField 
                        context={new Context()} 
                        onNotifyOutputChanged={(output) => setValue(output.value)}
                        parameters={{
                        value: {
                            raw: value ?? null
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