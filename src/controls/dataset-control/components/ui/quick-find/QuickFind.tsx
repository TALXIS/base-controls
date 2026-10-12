import { useMemo, useState } from "react";
import { IColumn } from "@talxis/client-libraries";
import { IQuickFindUiComponents, IQuickFindUiLabels, QuickFindUiComponents } from "./components";
import { getQuickFindUiStyles } from "./styles";

export interface IQuickFindUiProps {
    value: string;
    placeholder: string;
    /** The columns a search matches on; the field is disabled without any. */
    columns: IColumn[];
    isLikeQuery: boolean;
    disabled?: boolean;
    labels: IQuickFindUiLabels;
    onChange: (value: string) => void;
    onSearch: () => void;
    onClear: () => void;
    components?: Partial<IQuickFindUiComponents>;
}

/** A search field, and a callout explaining how it matches while the field is focused. */
export const QuickFind = (props: IQuickFindUiProps) => {
    const components = { ...QuickFindUiComponents, ...props.components };
    const styles = useMemo(() => getQuickFindUiStyles(), []);
    const id = useMemo(() => `quickfind-${crypto.randomUUID()}`, []);
    const [isCalloutVisible, setIsCalloutVisible] = useState(false);

    const search = () => {
        setIsCalloutVisible(false);
        props.onSearch();
    };

    const clear = () => {
        setIsCalloutVisible(false);
        props.onClear();
    };

    return <div id={id} className={styles.datasetControlQuickFind}>
        {components.onRenderTextField({
            value: props.value,
            placeholder: props.placeholder,
            disabled: props.disabled || props.columns.length === 0,
            onClick: () => setIsCalloutVisible(true),
            onBlur: () => setIsCalloutVisible(false),
            onChange: (_, value) => props.onChange(value ?? ''),
            onKeyUp: event => event.key === 'Enter' && search(),
            deleteButtonProps: props.value ? { key: 'clear', iconProps: { iconName: 'Cancel' }, onClick: clear } : undefined,
            suffixItems: [{ key: 'search', iconProps: { iconName: 'Search' }, onClick: search }],
        })}
        {isCalloutVisible && (props.columns.length > 0 || props.isLikeQuery) && components.onRenderCallout({
            target: `#${id}`,
            columns: props.columns,
            isLikeQuery: props.isLikeQuery,
            labels: props.labels,
            onDismiss: () => setIsCalloutVisible(false),
            components: components.callout,
        })}
    </div>;
};
