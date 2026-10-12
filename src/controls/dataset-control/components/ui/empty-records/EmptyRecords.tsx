import { useMemo } from 'react';
import { getClassNames } from '@utils';
import { EmptyRecordsUiComponents, IEmptyRecordsUiComponents } from './components';
import { getEmptyRecordsUiStyles } from './styles';

export interface IEmptyRecordsUiProps {
    /** What is said about there being nothing to show. */
    message: string;
    className?: string;
    components?: Partial<IEmptyRecordsUiComponents>;
}

/** An icon with a message saying there are no records to show. */
export const EmptyRecords = (props: IEmptyRecordsUiProps) => {
    const components = { ...EmptyRecordsUiComponents, ...props.components };
    const styles = useMemo(() => getEmptyRecordsUiStyles(), []);

    return components.onRenderContainer({
        className: getClassNames([styles.datasetControlEmptyRecords, props.className]),
        children: <>
            {components.onRenderIcon({ className: styles.icon, iconName: 'SearchAndApps' })}
            {components.onRenderText({ children: props.message })}
        </>,
    });
};
