import { useMemo } from 'react';
import { getClassNames } from "@core";
import { DatasetControlUiEmptyStateComponents, IDatasetControlUiEmptyStateComponents } from './components';
import { getDatasetControlUiEmptyStateStyles } from './styles';

/** Props for the empty state, as plain UI. */
export interface IDatasetControlUiEmptyStateProps {
    /** What is said about there being nothing to show. */
    message: string;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiEmptyStateComponents>;
}

/** An icon with a message saying there are no records to show. */
export const DatasetControlUiEmptyState = (props: IDatasetControlUiEmptyStateProps) => {
    const components = { ...DatasetControlUiEmptyStateComponents, ...props.components };
    const styles = useMemo(() => getDatasetControlUiEmptyStateStyles(), []);

    return components.onRenderContainer({
        className: getClassNames([styles.datasetControlEmptyState, props.className]),
        children: <>
            {components.onRenderIcon({ className: styles.icon, iconName: 'SearchAndApps' })}
            {components.onRenderText({ children: props.message })}
        </>,
    });
};
