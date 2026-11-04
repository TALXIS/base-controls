import { useMemo } from "react";
import type { Target } from "@fluentui/react";
import { IOptionSet, OptionSet } from "@fields/option-set";
import { TextField } from "@fields/text-field";
import type { IDataProvider } from "@talxis/client-libraries";
import { FilteringUi } from "../../../../../grid";
import { LookupManySelect } from "../lookup-many-select";
import { ILookupManyFilterComponents, LookupManyFilterComponents } from "./components";
import { getLookupManyFilterStyles } from "./styles";

type Reference = ComponentFramework.EntityReference;

/** What the chosen operator compares with. */
export type LookupManyFilterValueKind = 'records' | 'text' | 'none';

export interface ILookupManyFilterProps {
    target?: Target;
    title: string;
    /** What the operator and text controls are drawn with. */
    context: IOptionSet['context'];
    operators: { value: number; label: string }[];
    operator: number;
    valueKind: LookupManyFilterValueKind;
    /** Searched as the user types, for the records that can be picked. */
    dataProvider?: IDataProvider;
    records: Reference[];
    text: string;
    applyText: string;
    clearText: string;
    noRecordsFoundText: string;
    loadingText: string;
    /** The accessible name of a picked record's remove button. */
    getRemoveText: (reference: Reference) => string;
    isClearDisabled: boolean;
    components?: Partial<ILookupManyFilterComponents>;
    onOperatorChange: (operator: number) => void;
    onRecordsChange: (records: Reference[]) => void;
    onTextChange: (text: string) => void;
    onApply: () => void;
    onClear: () => void;
    onDismiss: () => void;
}

/** A lookup-many column's filter with an operator, its value, and Apply and Clear. */
export const LookupManyFilter = (props: ILookupManyFilterProps) => {
    const components = { ...LookupManyFilterComponents, ...props.components };
    const styles = useMemo(() => getLookupManyFilterStyles(), []);

    return <FilteringUi.Callout target={props.target} title={props.title} onDismiss={props.onDismiss} components={components.callout}>
        {components.onRenderContainer({
            className: styles.root,
            children: <>
                <OptionSet
                    context={props.context}
                    parameters={{ value: { raw: props.operator, attributes: { Options: props.operators.map(operator => ({ Value: operator.value, Label: operator.label, Color: '' })) } } as IOptionSet['parameters']['value'] }}
                    onNotifyOutputChanged={outputs => outputs.value != null && props.onOperatorChange(outputs.value)} />
                {components.onRenderValue({
                    className: styles.value,
                    children: <>
                        {props.valueKind === 'records' && <LookupManySelect
                            dataProvider={props.dataProvider}
                            value={props.records}
                            autoFocus
                            noRecordsFoundText={props.noRecordsFoundText}
                            loadingText={props.loadingText}
                            getRemoveText={props.getRemoveText}
                            components={components.select}
                            placeholder='---'
                            isMenuPopup
                            onChange={props.onRecordsChange} />}
                        {props.valueKind === 'text' && <TextField
                            context={props.context}
                            parameters={{ value: { raw: props.text }, AutoFocus: { raw: true } }}
                            onNotifyOutputChanged={outputs => props.onTextChange(outputs.value ?? '')} />}
                    </>,
                })}
                {components.onRenderButtons({
                    className: styles.buttons,
                    children: <>
                        {components.onRenderApplyButton({ text: props.applyText, onClick: props.onApply })}
                        {components.onRenderClearButton({ text: props.clearText, disabled: props.isClearDisabled, onClick: props.onClear })}
                    </>,
                })}
            </>,
        })}
    </FilteringUi.Callout>;
};
