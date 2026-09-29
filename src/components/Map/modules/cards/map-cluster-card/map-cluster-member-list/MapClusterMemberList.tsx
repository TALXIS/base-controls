import { useMemo } from 'react';
import { IRecord } from '@talxis/client-libraries';
import { ITheme } from '@legacy';
import { IMapClusterMemberRenderer } from '../../cards';
import { IMapLocation } from '../../../../providers/provider';
import { IMapCardsLabels } from '../../labels';
import { MapClusterMemberRow } from '../map-cluster-member-row';
import { getMapClusterMemberListStyles } from './styles';

export interface IMapClusterMemberListProps {
    records: IRecord[];
    labels: IMapCardsLabels;
    theme: ITheme;
    /** The member's own pin, so its row can show it the way the map does. */
    onGetMemberLocation: (record: IRecord) => IMapLocation | undefined;
    /** Renders one row. Defaults to the member's pin and primary name. */
    onRenderMember?: IMapClusterMemberRenderer;
    onPick: (recordId: string) => void;
}

/** One row per record behind a grouped pin, each a button that opens that record's card. */
export const MapClusterMemberList = (props: IMapClusterMemberListProps) => {
    const { records, labels, theme, onGetMemberLocation, onPick } = props;
    const styles = useMemo(() => getMapClusterMemberListStyles(theme), [theme]);
    const renderMember = props.onRenderMember ?? ((memberProps) => <MapClusterMemberRow {...memberProps} />);

    return (
        <ul className={styles.list}>
            {records.map((record) => {
                const recordId = record.getRecordId();
                return (
                    <li key={recordId}>
                        <button type="button" className={styles.member} onClick={() => onPick(recordId)}>
                            {renderMember({ record, location: onGetMemberLocation(record), theme, labels })}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};
