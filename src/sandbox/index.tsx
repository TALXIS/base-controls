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
initializeIcons();

export const Sandbox: React.FC = () => {
  //const [value, setValue] = useState<string | Date | undefined>("shit");
  const [value, setValue] = useState<string | Date | undefined>(new Date('2016-08-04T17:14:00Z'));
  const [decimalValue, setDecimalValue] = useState<number>();
  const [selectedValue, setSelectedValue] = useState<number | null>();
  const [selectedKeys, setSelectedKeys] = useState<number[] | undefined>();
  const [twoOptionValue, setTwoOptionValue] = useState<number | undefined>();
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [test, setTest] = useState("");
  const context = new Context();

  return (
    <>
      
    </>
  );
};
