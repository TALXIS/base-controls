import { useMemo, useState } from "react";
import { PanelType } from "@fluentui/react";
import { DataType, DataTypes, IColumn } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { ILocalizationService } from "@utils";
import { Panel } from "@ui/surfaces/panel/Panel";
import { Form } from "@controls/form/components/Form";
import { MemoryStrategy } from "@controls/form/strategies/MemoryStrategy";
import { useTaskDatasetControl } from "../../../../dataset-control/context";
import type { ICustomColumnDefinition, IIndexedDbCustomColumnFormEvents } from "../IndexedDbCustomColumnForm";
import type { IIndexedDbCustomColumnFormLabels } from "../labels";

const TYPES: [DataType, keyof IIndexedDbCustomColumnFormLabels][] = [
    [DataTypes.SingleLineText, 'typeText'],
    [DataTypes.Multiple, 'typeMultilineText'],
    [DataTypes.WholeNone, 'typeWholeNumber'],
    [DataTypes.Decimal, 'typeDecimal'],
    [DataTypes.Currency, 'typeCurrency'],
    [DataTypes.DateAndTimeDateOnly, 'typeDate'],
    [DataTypes.DateAndTimeDateAndTime, 'typeDateAndTime'],
    [DataTypes.TwoOptions, 'typeYesNo'],
    [DataTypes.OptionSet, 'typeChoice'],
];

const FIELDS = { displayName: 'displayName', dataType: 'dataType', precision: 'precision', options: 'options', isRequired: 'isRequired' };

//what the form edits; the type is the option's value
interface IColumnFormData {
    id: string;
    displayName: string;
    dataType: number;
    precision?: number;
    options?: string;
    isRequired: boolean;
}

const getColumns = (labels: ILocalizationService<IIndexedDbCustomColumnFormLabels>): IColumn[] => [
    { name: FIELDS.displayName, displayName: labels.getLocalizedString('columnName'), dataType: DataTypes.SingleLineText, metadata: { RequiredLevel: 2 } as IColumn['metadata'] },
    { name: FIELDS.dataType, displayName: labels.getLocalizedString('columnType'), dataType: DataTypes.OptionSet, metadata: { RequiredLevel: 2, OptionSet: TYPES.map(([, label], index) => ({ Value: index, Label: labels.getLocalizedString(label), Color: '' })) } as IColumn['metadata'] },
    { name: FIELDS.precision, displayName: labels.getLocalizedString('precision'), dataType: DataTypes.WholeNone, metadata: { MinValue: 0, MaxValue: 10 } as IColumn['metadata'] },
    { name: FIELDS.options, displayName: labels.getLocalizedString('options'), dataType: DataTypes.Multiple },
    { name: FIELDS.isRequired, displayName: labels.getLocalizedString('isRequired'), dataType: DataTypes.TwoOptions, metadata: { OptionSet: [{ Value: 0, Label: labels.getLocalizedString('no'), Color: '' }, { Value: 1, Label: labels.getLocalizedString('yes'), Color: '' }] } as IColumn['metadata'] },
];

const toFormData = (definition: ICustomColumnDefinition): IColumnFormData => ({
    id: 'column',
    displayName: definition.displayName,
    dataType: Math.max(0, TYPES.findIndex(([dataType]) => dataType === definition.dataType)),
    precision: definition.precision,
    options: definition.options?.join('\n'),
    isRequired: !!definition.isRequired,
});

const toDefinition = (data: IColumnFormData): ICustomColumnDefinition => {
    const dataType = TYPES[data.dataType]?.[0] ?? DataTypes.SingleLineText;
    const hasPrecision = dataType === DataTypes.Decimal || dataType === DataTypes.Currency;
    return {
        displayName: data.displayName.trim(),
        dataType,
        isRequired: !!data.isRequired,
        precision: hasPrecision ? data.precision ?? 2 : undefined,
        options: dataType === DataTypes.OptionSet ? (data.options ?? '').split('\n').map(option => option.trim()).filter(Boolean) : undefined,
    };
};

/** The IndexedDB custom columns' form: a column's name, type and what the type needs. */
export const ColumnFormPanel = () => {
    const form = useTaskDatasetControl().services.get('customColumnForm');
    const { rerender } = useRerender();
    useEventEmitter<IIndexedDbCustomColumnFormEvents>(form.events, 'onChanged', rerender);
    const definition = form.getDefinition();
    return definition ? <ColumnFormPanelContent definition={definition} /> : null;
};

const ColumnFormPanelContent = (props: { definition: ICustomColumnDefinition }) => {
    const form = useTaskDatasetControl().services.get('customColumnForm');
    const labels = form.getLabels();
    const data = useMemo(() => toFormData(props.definition), [props.definition]);
    const [dataType, setDataType] = useState(TYPES[data.dataType][0]);
    const strategy = useMemo(() => new MemoryStrategy({
        onGetData: () => data,
        onGetColumns: () => getColumns(labels),
        onGetMetadata: () => ({ PrimaryIdAttribute: 'id', PrimaryNameAttribute: FIELDS.displayName }),
    }), [data]);
    const hasPrecision = dataType === DataTypes.Decimal || dataType === DataTypes.Currency;

    return <Panel isOpen type={PanelType.smallFixedFar} headerText={labels.getLocalizedString(form.isNew() ? 'newColumnTitle' : 'editColumnTitle')} onDismiss={() => form.dismiss()}>
        <Form.Root
            strategy={strategy}
            onFieldValueChanged={(fieldName, value) => fieldName === FIELDS.dataType && setDataType(TYPES[value]?.[0] ?? DataTypes.SingleLineText)}
            onAfterSave={({ success }) => success && form.save(toDefinition(data))}>
            <Form.Ribbon />
            <Form.Notifications />
            <Form.Section>
                {[FIELDS.displayName, FIELDS.dataType, ...hasPrecision ? [FIELDS.precision] : [], ...dataType === DataTypes.OptionSet ? [FIELDS.options] : [], FIELDS.isRequired].map(name =>
                    <Form.Field key={name} name={name}>
                        <Form.Cell><Form.Control /></Form.Cell>
                    </Form.Field>)}
            </Form.Section>
        </Form.Root>
    </Panel>;
};
