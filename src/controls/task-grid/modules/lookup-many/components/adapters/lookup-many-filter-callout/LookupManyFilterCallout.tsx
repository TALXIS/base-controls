import { useEffect, useMemo, useState } from "react";
import { Operators } from "@talxis/client-libraries";
import { useLabels, usePcfContext } from "@utils";
import { useDatasetControlModule } from "@controls/dataset-control";
import { FILTER_OPERATOR_LABEL_KEYS, FILTER_OPERATORS_LABELS, GRID_FILTERING_LABELS, useGridColumnHeader, useGridService } from "@controls/grid";
import { useTaskGridContext } from "../../../../../context";
import { LookupManyFilter, LookupManyFilterValueKind } from "../../ui";
import { getLookupManyComponents } from "../getLookupManyComponents";
import { LOOKUP_MANY_LABELS } from "../../../labels";

type Reference = ComponentFramework.EntityReference;
type Condition = ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression;

const RECORD_OPERATORS = new Set<number>([Operators.Equal.Value, Operators.DoesNotEqual.Value, Operators.ContainValues.Value, Operators.DoesNotContainValues.Value]);
const NO_VALUE_OPERATORS = new Set<number>([Operators.ContainsData.Value, Operators.DoesNotContainData.Value]);

const getValueKind = (operator: number): LookupManyFilterValueKind => RECORD_OPERATORS.has(operator) ? 'records' : NO_VALUE_OPERATORS.has(operator) ? 'none' : 'text';

//the text is stored with the wildcards a Dataverse filter takes
const wrapText = (operator: number, text: string): string => {
    switch (operator) {
        case Operators.BeginsWith.Value:
        case Operators.DoesNotBeginWith.Value: {
            return `${text}%`;
        }
        case Operators.EndsWith.Value:
        case Operators.DoesNotEndWith.Value: {
            return `%${text}`;
        }
        default: {
            return `%${text}%`;
        }
    }
};

const unwrapText = (value: string): string => value.replace(/^%|%$/g, '');

/** A lookup-many column's filter callout, picking among the module's records and writing the condition into the tasks' filter. */
export const LookupManyFilterCallout = () => {
    const header = useGridColumnHeader();
    const context = usePcfContext();
    const operatorLabels = useLabels(FILTER_OPERATORS_LABELS);
    const column = header.getColumn()!;
    const lookupMany = useDatasetControlModule('lookupMany');
    const { runtime } = useTaskGridContext();
    const filteringLabels = useLabels(GRID_FILTERING_LABELS);
    const calloutComponents = useGridService('grid').modules.find('filtering')?.components.filterCallout;
    const labels = useLabels(LOOKUP_MANY_LABELS);
    const condition = useMemo(() => lookupMany.getFilterCondition(column.name), []);
    const [operator, setOperator] = useState<number>(condition?.conditionOperator ?? Operators.ContainValues.Value);
    const [records, setRecords] = useState<Reference[]>(() => getSavedRecords(condition));
    const [text, setText] = useState(() => condition && getValueKind(condition.conditionOperator) === 'text' ? unwrapText(`${condition.value ?? ''}`) : '');
    const optionsProvider = useMemo(() => lookupMany.createOptionsProvider(undefined, column), [column]);
    const appearance = lookupMany.getColumn(column.name)?.appearance;
    const selectComponents = useMemo(() => getLookupManyComponents(appearance), [appearance]);
    const valueKind = getValueKind(operator);
    useEffect(() => () => optionsProvider?.destroy(), [optionsProvider]);

    //the names of saved ids come from the records the tasks hold
    function getSavedRecords(saved: Condition | undefined): Reference[] {
        if (!saved || getValueKind(saved.conditionOperator) !== 'records') {
            return [];
        }
        const ids: string[] = Array.isArray(saved.value) ? saved.value : [saved.value];
        const known = new Map(runtime.getProvider().getAllRecords().flatMap(record => lookupMany.getValue(record.getRecordId(), column.name)).map(reference => [reference.id.guid, reference]));
        return ids.map(id => known.get(id) ?? { id: { guid: id }, name: id, etn: lookupMany.getColumn(column.name)?.entityName });
    }

    const getConditionValue = (): string | string[] | null => {
        switch (valueKind) {
            case 'records': {
                return records.map(reference => reference.id.guid);
            }
            case 'text': {
                return wrapText(operator, text);
            }
            case 'none': {
                return null;
            }
        }
    };

    //nothing to compare with leaves the column unfiltered
    const onApply = () => {
        const isEmpty = (valueKind === 'records' && records.length === 0) || (valueKind === 'text' && !text);
        lookupMany.setFilterCondition(column.name, isEmpty ? null : { attributeName: column.name, conditionOperator: operator as Condition['conditionOperator'], value: getConditionValue() as Condition['value'] });
        lookupMany.closeFilter();
    };

    const onClear = () => {
        setRecords([]);
        setText('');
    };

    const supportedOperators: number[] = column.metadata?.SupportedFilterConditionOperators ?? [];
    return <LookupManyFilter
        target={header.getElement()}
        title={filteringLabels.get('gridFiltering.filterMenuFilterBy')}
        context={context}
        operators={supportedOperators.map(value => ({ value, label: operatorLabels.get(FILTER_OPERATOR_LABEL_KEYS[value]) }))}
        operator={operator}
        valueKind={valueKind}
        dataProvider={optionsProvider}
        records={records}
        text={text}
        applyText={filteringLabels.get('gridFiltering.apply')}
        clearText={filteringLabels.get('gridFiltering.clear')}
        noRecordsFoundText={labels.get('lookupMany.noRecordsFound')}
        loadingText={labels.get('lookupMany.loading')}
        isClearDisabled={records.length === 0 && !text}
        selectComponents={selectComponents}
        calloutComponents={calloutComponents}
        onOperatorChange={setOperator}
        onRecordsChange={setRecords}
        onTextChange={setText}
        onApply={onApply}
        onClear={onClear}
        onDismiss={() => lookupMany.closeFilter()} />;
};
