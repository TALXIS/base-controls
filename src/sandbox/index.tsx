import { initializeIcons, Label, PrimaryButton } from "@fluentui/react";
import { TextField as TalxisTextField } from "@talxis/react-components/dist/components/TextField";
import { TextField as TalxisDecimalField } from "@talxis/react-components/dist/components/TextField";
import React, { useState } from "react";
import { TextField } from "../components/TextField/TextField";
import { Context } from "./mock/Context";
import { Decimal } from "../components/Decimal/Decimal";
import { OptionSet } from "../components/OptionSet";
import { IDecimalNumberProperty, IOptionSetProperty } from "../interfaces";
import {options} from './shared/optionList';
initializeIcons();

export const Sandbox: React.FC = () => {
  //const [value, setValue] = useState<string | Date | undefined>("shit");
  const [value, setValue] = useState<string | Date | undefined>(new Date('2016-08-04T17:14:00Z'));
  const [decimalValue, setDecimalValue] = useState<number>();
  const [selectedValue, setSelectedValue] = useState<number| null>();
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [test, setTest] = useState("");
  const context = new Context();

  return (
    <>
      <Label>Outside change</Label>
{/*       <TalxisTextField value={value} onChange={(e, value) => setValue(value)} /> */}
      <Decimal
        context={context}
        parameters={{
          EnableBorder: { raw: true },
          EnableCopyButton: { raw: false },
          value: {
            attributes: {
              Precision: 2
            },
            raw: decimalValue ?? null
          } as IDecimalNumberProperty,
        }}
        onNotifyOutputChanged={(outputs) => {
          setDecimalValue(outputs.value);
        }}
      />
       <Label>Component</Label>
      <OptionSet
        context={context}
        parameters={{
          EnableCopyButton: {
            raw: true
          },
          EnableDeleteButton: {
            raw: true
          },
          AutoFocus: {
            raw: true
          },
          value: {
            raw: selectedValue ?? null,
            attributes: {
              DefaultValue: -1,
              Options: options
            }
          } as IOptionSetProperty
        }}
        onNotifyOutputChanged={(outputs) => {
          setSelectedValue(outputs.value);
        }} />
    </>
  );
};
