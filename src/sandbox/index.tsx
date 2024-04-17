import { initializeIcons, Label, PrimaryButton } from "@fluentui/react";
import { TextField as TalxisTextField } from "@talxis/react-components/dist/components/TextField";
import { TextField as TalxisDecimalField } from "@talxis/react-components/dist/components/TextField";
import React, { useState } from "react";
import { TextField } from "../components/TextField/TextField";
import { Context } from "./mock/Context";
import { Decimal } from "../components/Decimal/Decimal";
import { OptionSet } from "../components/OptionSet";
import { IDecimalNumberProperty, IOptionSetProperty } from "../interfaces";
import { DateTime } from "../components/DateTime";

initializeIcons();

export const Sandbox: React.FC = () => {
  //const [value, setValue] = useState<string | Date | undefined>("shit");
  const [value, setValue] = useState<string | Date | undefined>(new Date('2016-08-04T17:14:00Z'));
  const [decimalValue, setDecimalValue] = useState<number>();
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [test, setTest] = useState("");
  const context = new Context();

  return (
    <>
      <Label>Outside change</Label>
{/*       <TalxisTextField value={value} onChange={(e, value) => setValue(value)} /> */}
      <DateTime 
        context={context}
        onNotifyOutputChanged={(outputs) => setValue(outputs.value)}
        translations={{
          time: {
            1029: 'cestina',
          }
        }}
        parameters={{
          value: {
            raw: value as any,
            //@ts-ignore
            attributes: {
              Behavior: 1,
              Format: 'DateAndTime'
            }
          },
        }} />
    </>
  );
};
