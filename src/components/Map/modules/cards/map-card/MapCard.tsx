import { DefaultButton } from '@fluentui/react';
import { useMemo } from 'react';
import { IColumn } from '@talxis/client-libraries';
import { getRecordFormattedValue } from '../../../core/attributes';
import { IMapCardProps } from '../cards';
import { getMapCardStyles } from './styles';

/** Columns shown when the card names none, so a card is useful before anyone configures it. */
const DEFAULT_COLUMN_LIMIT = 6;

/** Reads the attributes a card should show. */
const getCardColumns = (props: IMapCardProps): string[] => {
    if (props.definition.columns?.length) {
        return props.definition.columns;
    }
    const columns: IColumn[] = props.record.getColumns?.() ?? [];
    return columns
        .filter((column) => !column.isHidden && column.type !== 'action')
        .slice(0, DEFAULT_COLUMN_LIMIT)
        .map((column) => column.name);
};

/**
 * The card a pin opens by default: the record's attributes, and whatever buttons the card was given.
 *
 * Values come through the same resolver as every other attribute, so a card can show something held on a
 * related record with a dot notation path.
 */
export const MapCard = (props: IMapCardProps) => {
    const styles = useMemo(() => getMapCardStyles(props.theme), [props.theme]);
    const columns = useMemo(() => getCardColumns(props), [props.definition.columns, props.record]);
    const columnsByName = useMemo(
        () => new Map((props.record.getColumns?.() ?? []).map((column) => [column.name, column])),
        [props.record]
    );

    const title = props.definition.title
        ?? (typeof props.record.getNamedReference()?.name === 'string' ? props.record.getNamedReference()!.name : undefined)
        ?? props.location.label;

    const fields = columns
        .map((name) => ({
            name,
            label: columnsByName.get(name)?.displayName ?? name,
            value: getRecordFormattedValue(props.record, name)
        }))
        .filter((field) => field.value !== undefined);

    return (
        <div className={styles.root}>
            {title && <span className={styles.title}>{title}</span>}
            {fields.length
                ? <div className={styles.fields}>
                    {fields.map((field) => [
                        <span key={`${field.name}-label`} className={styles.fieldLabel}>{field.label}</span>,
                        <span key={`${field.name}-value`} className={styles.fieldValue}>{field.value}</span>
                    ])}
                </div>
                : <span className={styles.empty}>{props.labels.cardNoDetails()}</span>}
            {(!!props.definition.actions?.length || props.onDelete) &&
                <div className={styles.actions}>
                    {props.definition.actions?.map((action) => (
                        <DefaultButton
                            key={`${action.webResourceName}|${action.functionName}|${action.label}`}
                            text={action.label}
                            onClick={() => props.onExecuteAction(action)} />
                    ))}
                    {props.onDelete &&
                        <DefaultButton
                            iconProps={{ iconName: 'Delete' }}
                            text={props.labels.cardDelete()}
                            onClick={props.onDelete} />}
                </div>}
        </div>
    );
};
