import { initializeIcons, Label, PrimaryButton, TextFieldBase} from '@fluentui/react';
import { TextField as TalxisTextField } from '@talxis/react-components/dist/components/TextField';
import React, { useEffect, useState } from 'react';
import { TextField } from '../components/TextField/TextField';
import { Context } from './mock/Context';
import { Decimal } from '../components/Decimal/Decimal';

initializeIcons();

export const Sandbox: React.FC = () => {
    const [value, setValue] = useState<string>();
    const [decimalValue, setDecimalValue] = useState<number>();
    const [isMounted, setIsMounted] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
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
                        onNotifyOutputChanged={(outputs) => {
                            setValue(outputs.value as string);
                        }}
                        parameters={{
                            IsMultiLine: {
                                raw: true
                            },
                            isResizable: {
                                raw: false
                            },
                            EnableCopyButton: {
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

            <Label>Decimal component</Label>
            <Decimal
                context={new Context()}
                parameters={{
                    IsMultiLine: { raw: true },
                    isResizable: { raw: false },
                    EnableCopyButton: { raw: false },
                    value: { raw: decimalValue ?? null,
                     errorMessage:isNaN(decimalValue!) ? "This is decimal column": '',
                    error:hasError  },
                    
                }}
                onNotifyOutputChanged={(outputs) => {
                    setDecimalValue(outputs.value);
                    isNaN(outputs.value!) ?setHasError( true) :setHasError( false);
                }}
            />
        </>
    )
}