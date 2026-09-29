import { useMemo } from 'react';
import { IOverlayUiEmptyRecordsComponents, OverlayUiEmptyRecordsComponents } from './components';
import { getOverlayUiEmptyRecordsStyles } from './styles';

export interface IOverlayUiEmptyRecordsProps {
    /** What is said about there being nothing to show. */
    message: string;
    components?: Partial<IOverlayUiEmptyRecordsComponents>;
}

/** An empty state over the grid. */
export const OverlayUiEmptyRecords = (props: IOverlayUiEmptyRecordsProps) => {
    const components = { ...OverlayUiEmptyRecordsComponents, ...props.components };
    const styles = useMemo(() => getOverlayUiEmptyRecordsStyles(), []);

    return components.onRenderContainer({
        className: styles.root,
        children: <>
            {components.onRenderIcon({ className: styles.icon, iconName: 'SearchAndApps' })}
            {components.onRenderText({ children: props.message })}
        </>,
    });
};
