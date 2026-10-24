import { useMemo } from "react";
import { DefaultButton, PrimaryButton, Target, TextField } from "@fluentui/react";
import { IOptionSet, OptionSet } from "@controls/fields/option-set";
import type { IDataProvider } from "@talxis/client-libraries";
import { FilteringUi, IFilteringUiCalloutComponents } from "@controls/grid";
import { ILookupManySelectComponents, LookupManySelect } from "../lookup-many-select";
import { getLookupManyFilterStyles } from "./styles";

type Reference = ComponentFramework.EntityReference;

/** What the chosen operator compares with: picked records, a name fragment, or nothing. */
export type LookupManyFilterValueKind = 'records' | 'text' | 'none';

export interface ILookupManyFilterProps {
    target?: Target;
    title: string;
    /** What the operator control is drawn with. */
    context: IOptionSet['context'];
    operators: { value: number; label: string }[];
    operator: number;
    valueKind: LookupManyFilterValueKind;
    /** Searched as the user types, for the records that can be picked. */
    dataProvider?: IDataProvider;
    records: Reference[];
    text: string;
    textLabel: string;
    applyText: string;
    clearText: string;
    noRecordsFoundText: string;
    loadingText: string;
    isClearDisabled: boolean;
    selectComponents?: Partial<ILookupManySelectComponents>;
    calloutComponents?: Partial<IFilteringUiCalloutComponents>;
    onOperatorChange: (operator: number) => void;
    onRecordsChange: (records: Reference[]) => void;
    onTextChange: (text: string) => void;
    onApply: () => void;
    onClear: () => void;
    onDismiss: () => void;
}

/** A lookup-many column's filter: an operator, what it compares with, and Apply and Clear. */
export const LookupManyFilter = (props: ILookupManyFilterProps) => {
    const styles = useMemo(() => getLookupManyFilterStyles(), []);

    return <FilteringUi.Callout target={props.target} title={props.title} onDismiss={props.onDismiss} components={props.calloutComponents}>
        <div className={styles.root}>
            <OptionSet
                context={props.context}
                parameters={{ value: { raw: props.operator, attributes: { Options: props.operators.map(operator => ({ Value: operator.value, Label: operator.label, Color: '' })) } } as IOptionSet['parameters']['value'] }}
                onNotifyOutputChanged={outputs => outputs.value != null && props.onOperatorChange(outputs.value)} />
            <div className={styles.value}>
                {props.valueKind === 'records' && <LookupManySelect
                    dataProvider={props.dataProvider}
                    value={props.records}
                    autoFocus
                    noRecordsFoundText={props.noRecordsFoundText}
                    loadingText={props.loadingText}
                    components={props.selectComponents}
                    placeholder='---'
                    isMenuPopup
                    onChange={props.onRecordsChange} />}
                {props.valueKind === 'text' && <TextField ariaLabel={props.textLabel} placeholder='---' value={props.text} autoFocus onChange={(_, value) => props.onTextChange(value ?? '')} />}
            </div>
            <div className={styles.buttons}>
                <PrimaryButton text={props.applyText} onClick={props.onApply} />
                <DefaultButton text={props.clearText} disabled={props.isClearDisabled} onClick={props.onClear} />
            </div>
        </div>
    </FilteringUi.Callout>;
};
