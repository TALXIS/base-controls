import { useMemo } from 'react';
import { getClassNames } from "@core";
import { EmptyStateUiComponents, IEmptyStateUiComponents } from './components';
import { getEmptyStateUiStyles } from './styles';

/** Props for the empty state, as plain UI. */
export interface IEmptyStateUiProps {
    /** What is said about there being nothing to show. */
    message: string;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IEmptyStateUiComponents>;
}

/** An icon with a message saying there are no records to show. */
export const EmptyState = (props: IEmptyStateUiProps) => {
    const components = { ...EmptyStateUiComponents, ...props.components };
    const styles = useMemo(() => getEmptyStateUiStyles(), []);

    return components.onRenderContainer({
        className: getClassNames([styles.datasetControlEmptyState, props.className]),
        children: <>
            {components.onRenderIcon({ className: styles.icon, iconName: 'SearchAndApps' })}
            {components.onRenderText({ children: props.message })}
        </>,
    });
};
