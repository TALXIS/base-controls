import { TextField } from "@talxis/react-components/dist/components/TextField";
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
import React, { useEffect, useRef } from "react";
import numeral from "numeral";

export const Decimal = (props: IDecimal) => {
  const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent<
    number | string,
    IDecimalParameters,
    IDecimalOutputs
  >(props);
  const context = props.context;
  const parameters = props.parameters;
  const boundValue = parameters.value;
  const ref = useRef<HTMLDivElement>(null);

  const extractNumericPart = (str: any): number | undefined => {
    const regex = /^[\d,.\s]+$/;
    if (regex.test(str)) {
      let formatedValue = numeral(str).value() || undefined;
      return formatedValue!;
    } 
    else {
      return value as number;
    }
  };

  const formatNumber = (decimalVal: number): number => {
    if (decimalVal && !isNaN(decimalVal)) {
      const formatedDecimalValue = context.formatting.formatDecimal(+decimalVal);
      return context.formatting.formatInteger(formatedDecimalValue as unknown as number) as unknown as number;
    } 
    else {
      return decimalVal;
    }
  };

  useEffect(() => {
    if (boundValue.raw != null) {
      let numericValue = extractNumericPart(boundValue.raw);
      if (numericValue && !isNaN(numericValue)) {
        setValue(formatNumber(numericValue));
      }
    }
  }, [boundValue.raw]);

  return (
    <TextField
      readOnly={context.mode.isControlDisabled}
      autoFocus={parameters.AutoFocus?.raw}
      elementRef={ref}
      borderless={parameters.EnableBorder?.raw === false}
      errorMessage={boundValue.error ? boundValue.errorMessage : ""}
      deleteButtonProps={
        parameters.EnableDeleteButton?.raw === true
          ? {
              key: "delete",
              showOnlyOnHover: true,
              iconProps: {
                iconName: "Delete",
              },
              onClick: () => setValue(null),
            }
          : undefined
      }
      clickToCopyProps={
        parameters.EnableCopyButton?.raw === true
          ? {
              key: "copy",
              iconProps: {
                iconName: "Copy",
              },
            }
          : undefined
      }
      value={value != null ? (value as unknown as string) : undefined}
      onBlur={(event) => {
        let numericValue = extractNumericPart(event.target.value);
        onNotifyOutputChanged({
          value: numericValue,
        });
      }}
      onChange={(e, value) => {
        setValue(value ?? null);
      }}
    />
  );
};
