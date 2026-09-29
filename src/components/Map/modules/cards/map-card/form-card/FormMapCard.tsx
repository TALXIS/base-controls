import { Spinner, SpinnerSize } from '@fluentui/react';
import { useEffect, useMemo, useState } from 'react';
import { executeFunctionAsync } from '@talxis/client-libraries';
import { IXrmFormContext, XrmForm, XrmMemoryStrategy } from '@components/Form';
import { PcfContextProvider } from '@utils/adapters/pcf-context';
import { IMapCardProps } from '../../cards';
import { loadMapCardFormXml } from './formXml';
import { getFormMapCardStyles } from './styles';

/** Reads the id and name attributes the form binds the record by, from the dataset the record came from. */
const getRecordMetadata = (props: IMapCardProps) => {
    const metadata = props.record.getDataProvider?.()?.getMetadata?.() ?? {};
    const primaryName = props.record.getColumns?.().find((column) => column.isPrimary)?.name;
    return {
        PrimaryIdAttribute: metadata.PrimaryIdAttribute ?? primaryName ?? 'id',
        PrimaryNameAttribute: metadata.PrimaryNameAttribute ?? primaryName ?? 'name'
    };
};

/**
 * Runs the card's load handler, the way a form runs its OnLoad handler: the function gets the record and
 * the form's `formContext`, so a script written against `formContext` customises the card's form too.
 */
const runFormLoadHandler = (props: IMapCardProps, formContext: IXrmFormContext) => {
    const { webResourceName, functionName } = props.definition;
    if (!webResourceName || !functionName) {
        return;
    }
    //@ts-ignore - executeFunction is missing from @types/xrm
    if (typeof window.Xrm?.Utility?.executeFunction !== 'function') {
        console.warn(`Map: the card form handler "${functionName}" needs a host that provides Xrm, so nothing ran.`);
        return;
    }
    executeFunctionAsync(webResourceName, functionName, [{ recordId: props.record.getRecordId(), record: props.record, formContext }])
        .catch((error) => console.error(`Map: the card form handler "${functionName}" in "${webResourceName}" failed:`, error));
};

/**
 * Renders a record through the Form base control's `XrmForm`, laid out by FormXml.
 *
 * The record's own data and columns feed the form, so what a card shows is laid out by a form a maker
 * designed - inline in the definition, or a `systemform` read through `Xrm.WebApi`. Changes made on the card
 * stay on the card: it is a view of the record, not a second place to save it.
 */
export const FormMapCard = (props: IMapCardProps) => {
    const styles = useMemo(() => getFormMapCardStyles(props.theme), [props.theme]);
    //undefined while the FormXml is being read, null once it turned out there is none
    const [formXml, setFormXml] = useState<string | null>();

    useEffect(() => {
        let isCurrent = true;
        setFormXml(undefined);
        loadMapCardFormXml(props.definition).then((loaded) => {
            if (isCurrent) {
                setFormXml(loaded ?? null);
            }
        });
        return () => {
            isCurrent = false;
        };
    }, [props.definition.formXml, props.definition.formId]);

    const strategy = useMemo(() => {
        if (!formXml) {
            return undefined;
        }
        const data = props.record.getRawData();
        const columns = props.record.getColumns?.() ?? [];
        const metadata = getRecordMetadata(props);
        return new XrmMemoryStrategy({
            onGetData: () => data,
            onGetColumns: () => columns,
            onGetMetadata: () => metadata,
            onGetFormXml: () => formXml
        });
    }, [formXml, props.record]);

    if (formXml === undefined) {
        return <div className={styles.root}><Spinner size={SpinnerSize.small} className={styles.status} /></div>;
    }
    if (!strategy) {
        return <div className={styles.root}><span className={styles.status}>{props.labels.cardFormUnavailable()}</span></div>;
    }
    return (
        <div className={styles.root}>
            <PcfContextProvider context={props.context as any}>
                <XrmForm strategy={strategy} onFormReady={({ formContext }) => runFormLoadHandler(props, formContext)} />
            </PcfContextProvider>
        </div>
    );
};
