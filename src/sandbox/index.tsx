import { initializeIcons, Label, TagPicker } from "@fluentui/react";
import React, { useState } from "react";
import { Context } from "./mock/Context";
import { Decimal } from "../components/Decimal/Decimal";
import { OptionSet } from "../components/OptionSet";
import { IDecimalNumberProperty, IMultiSelectOptionSetProperty, IOptionSetProperty, ITwoOptionsProperty } from "../interfaces";
import { options } from './shared/optionList';
import { multiSelectOptions } from './shared/multiSelectOptionList';
import { MultiSelectOptionSet } from "../components/MultiSelectOptionSet";
import { TwoOptions } from "../components/TwoOptions";
import { Lookup } from "../components/Lookup";
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
      <TagPicker onResolveSuggestions={() => {
        return [
          {
            key: 'a',
            name: 'a'
          },
          {
            key: 'b',
            name: 'b'
          }
        ]
      }} />
      <Label>Outside change</Label>
      {/*       <TalxisTextField value={value} onChange={(e, value) => setValue(value)} /> */}
      <Decimal
        //@ts-ignore
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
      //@ts-ignore
        context={context}
        parameters={{
          EnableCopyButton: {
            raw: true
          },
          EnableDeleteButton: {
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
        //@ts-ignore
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
      <Label>Component</Label>
      <TwoOptions 
        //@ts-ignore
        context={context} parameters={{
        value: {
          raw: true,
          attributes: {
            Options: [
              {
                Color: '',
                Label: 'Yes',
                Value: 0
              },
              {
                Color: '',
                Label: 'No',
                Value: 1
              }
            ]
          }
        } as ITwoOptionsProperty
      }} />
    </>
  );
};
