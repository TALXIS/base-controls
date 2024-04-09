import { initializeIcons, Label, PrimaryButton } from "@fluentui/react";
import { TextField as TalxisTextField } from "@talxis/react-components/dist/components/TextField";
import { TextField as TalxisDecimalField } from "@talxis/react-components/dist/components/TextField";
import React, { useState } from "react";
import { TextField } from "../components/TextField/TextField";
import { Context } from "./mock/Context";
import { Decimal } from "../components/Decimal/Decimal";
import { OptionSet } from "../components/OptionSet";
import { IDecimalNumberProperty, IOptionSetProperty } from "../interfaces";

initializeIcons();

export const Sandbox: React.FC = () => {
  const [value, setValue] = useState<string>();
  const [decimalValue, setDecimalValue] = useState<number>();
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [test, setTest] = useState("");
  const context = new Context();

  return (
    <>
      <Label>Outside change</Label>
      <TalxisTextField value={value} onChange={(e, value) => setValue(value)} />
      {isMounted && (
        <>
          <Label>Component</Label>
          <TextField
            context={new Context()}
            onNotifyOutputChanged={(outputs) => {
              setValue(outputs.value as string);
            }}
            parameters={{
              IsMultiLine: {
                raw: true,
              },
              isResizable: {
                raw: false,
              },
              EnableCopyButton: {
                raw: true,
              },
              value: {
                raw: value ?? null,
              },
            }}
          />
        </>
      )}
      <br />
      <PrimaryButton
        text="Mount/Unmount component"
        onClick={() => setIsMounted(!isMounted)}
      />
      <br />
      <br />
      <PrimaryButton
        text="Trigger rerender"
        onClick={() => setTest(Math.random().toString())}
      />
      <Label>Outside changes</Label>
      <TalxisDecimalField
      value={decimalValue as any}
        onChange={(event) => {
            //@ts-ignore
          setDecimalValue(event.target.value);
        }}
      />
      <Label>Decimal component</Label>
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
      <OptionSet
        context={context}
        parameters={{
          value: {
            raw: 1,
            attributes: {
              DefaultValue: -1,
              Options: []
            }
          } as IOptionSetProperty
        }} />
    </>
  );
};
