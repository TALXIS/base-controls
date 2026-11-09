import { FontIcon, Spinner, SpinnerSize } from '@fluentui/react';
import { useMemo } from 'react';
import { IMapStatusProps } from '../components/components';
import { getMapStatusStyles } from './styles';

/** A small overlay reporting what the control is doing - loading every page, resolving addresses, or that a load stopped short. */
export const MapStatus = (props: IMapStatusProps) => {
    const styles = useMemo(() => getMapStatusStyles(props.theme), [props.theme]);

    if (!props.message) {
        return null;
    }

    return (
        <div className={styles.root}>
            {props.isBusy && <Spinner size={SpinnerSize.xSmall} />}
            {props.isWarning && !props.isBusy && <FontIcon iconName='Warning' className={styles.warningIcon} />}
            <span>{props.message}</span>
        </div>
    );
};
