import { initializeIcons, Label } from "@fluentui/react";
import React, { useState } from "react";
import { Context } from "./mock/Context";
import { Decimal } from "../components/Decimal/Decimal";
import { OptionSet } from "../components/OptionSet";
import { IDecimalNumberProperty, IMultiSelectOptionSetProperty, IOptionSetProperty } from "../interfaces";
import { options } from './shared/optionList';
import { multiSelectOptions } from './shared/multiSelectOptionList';
import { MultiSelectOptionSet } from "../components/MultiSelectOptionSet";
initializeIcons();

export const Sandbox: React.FC = () => {
  //const [value, setValue] = useState<string | Date | undefined>("shit");
  const [value, setValue] = useState<string | Date | undefined>(new Date('2016-08-04T17:14:00Z'));
  const [decimalValue, setDecimalValue] = useState<number>();
  const [selectedValue, setSelectedValue] = useState<number | null>();
  const [selectedKeys, setSelectedKeys] = useState<number[] | undefined>();
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

      <Label>Component</Label>
      <MultiSelectOptionSet
        context={context}
        parameters={{
          value: {
            raw: selectedKeys,
            attributes: {
              DefaultValue: -1,
              Options: multiSelectOptions
            }
          } as IMultiSelectOptionSetProperty
        }}
        onNotifyOutputChanged={(outputs) => {
          setSelectedKeys(outputs.value);
        }}
      />
    </>
  );
};
