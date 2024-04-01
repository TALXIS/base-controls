import { initializeIcons, Label, PrimaryButton} from '@fluentui/react';
import { TextField as TalxisTextField } from '@talxis/react-components/dist/components/TextField';
import { TextField as TalxisDecimalField } from '@talxis/react-components/dist/components/TextField';
import React, {  useState } from 'react';
import { TextField } from '../components/TextField/TextField';
import { Context } from './mock/Context';
import { Decimal } from '../components/Decimal/Decimal';

initializeIcons();

export const Sandbox: React.FC = () => {
    const [value, setValue] = useState<string>();
    const [decimalValue, setDecimalValue] = useState<number|null>(null);
    const [isMounted, setIsMounted] = useState<boolean>(true);
    const [test, setTest] = useState('');
    const context = new Context();
     function formatNumber(decimalVal: number):number{
        if(decimalVal && !isNaN(decimalVal)){
            const formatedDecimalValue = context.formatting.formatDecimal(+decimalVal);
            return context.formatting.formatInteger(formatedDecimalValue as unknown as number) as unknown as number;
        }else return decimalVal;
    }
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
            <Label>Outside changes</Label>
            <TalxisDecimalField onChange={(e, value) => setDecimalValue(formatNumber(value as unknown as number))} />
            <Label>Decimal component</Label>
            <Decimal
                context={context}
                parameters={{
                    EnableBorder:{raw:true},
                    EnableCopyButton: { raw: false },
                    value:{
                        raw:decimalValue ?? null
                    }  
                }}
                
                onNotifyOutputChanged={(outputs) => {
                    setDecimalValue(formatNumber(outputs.value!));
                }}
            />
        </>
    )
}