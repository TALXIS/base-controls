import { useMemo } from 'react';
import { IMapClusterMemberProps } from '../../cards';
import { MapPinSwatch } from '../../../../map-pin-swatch';
import { getMapClusterMemberRowStyles } from './styles';

/**
 * The row a grouped pin's list shows for one record when the host provides nothing else: the record's pin
 * and its primary name.
 */
export const MapClusterMemberRow = (props: IMapClusterMemberProps) => {
    const { record, location, theme } = props;
    const styles = useMemo(() => getMapClusterMemberRowStyles(theme), [theme]);
    const name = record.getNamedReference()?.name;
    const label = typeof name === 'string' && name ? name : location?.label ?? record.getRecordId();

    return (
        <>
            <MapPinSwatch pin={location?.pin} theme={theme} />
            <span className={styles.label}>{label}</span>
        </>
    );
};
