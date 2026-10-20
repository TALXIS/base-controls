import { DefaultButton, IconButton } from '@fluentui/react';
import { ReactNode, useMemo, useState } from 'react';
import { IRecord } from '@talxis/client-libraries';
import { ITheme } from '@legacy';
import { IMapClusterInfo } from '../../../providers/provider';
import { IMapClusterMemberRenderer } from '../cards';
import { IMapLocation } from '../../../providers/provider';
import { IMapCardsLabels } from '../labels';
import { MapClusterMemberList } from './map-cluster-member-list';
import { getMapClusterCardStyles } from './styles';

export interface IMapClusterCardProps {
    cluster: IMapClusterInfo;
    /** The member records the control could resolve, in dataset order. */
    records: IRecord[];
    labels: IMapCardsLabels;
    theme: ITheme;
    /** The member's own pin, so its row can show it the way the map does. */
    onGetMemberLocation: (record: IRecord) => IMapLocation | undefined;
    /** Renders one row of the list. Defaults to the member's pin and primary name. */
    onRenderMember?: IMapClusterMemberRenderer;
    /** Renders the picked member's card, using whichever renderer that record's rules chose. */
    onRenderRecordCard: (record: IRecord) => ReactNode;
    /** Zooms the map to where the group comes apart. */
    onZoomIn: () => void;
}

/**
 * The card a grouped pin opens: the number of records behind it and one row per record, and - once a row is
 * picked - that record's own card in the same place, with a way back to the list.
 *
 * Rows rather than cards, because a group can stand for dozens of records and a record's card may be
 * expensive to bring up; only the record the user picks pays that price. A group can stand for thousands,
 * so only the ones the clusterer listed are shown and the rest are counted - zooming in is how you reach them.
 *
 * Which member is picked is this card's own state: a member that leaves the dataset while picked simply
 * falls back to the list, and a different group is a different card (providers key the popup by pin).
 */
export const MapClusterCard = (props: IMapClusterCardProps) => {
    const { cluster, records, labels, theme, onGetMemberLocation, onRenderMember, onRenderRecordCard, onZoomIn } = props;
    const styles = useMemo(() => getMapClusterCardStyles(theme), [theme]);
    const [pickedRecordId, setPickedRecordId] = useState<string>();
    const picked = pickedRecordId ? records.find((record) => record.getRecordId() === pickedRecordId) : undefined;

    if (picked) {
        const name = picked.getNamedReference()?.name;
        return (
            <div className={styles.root}>
                <div className={styles.header}>
                    <IconButton
                        iconProps={{ iconName: 'Back' }}
                        title={labels.cardBack()}
                        ariaLabel={labels.cardBack()}
                        onClick={() => setPickedRecordId(undefined)} />
                    <span className={styles.title}>{typeof name === 'string' ? name : ''}</span>
                </div>
                {onRenderRecordCard(picked)}
            </div>
        );
    }

    const notShown = cluster.count - records.length;
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <span className={styles.title}>{labels.cardGroup({ count: `${cluster.count}` })}</span>
                <DefaultButton text={labels.cardZoomIn()} onClick={onZoomIn} />
            </div>
            <MapClusterMemberList
                records={records}
                labels={labels}
                theme={theme}
                onGetMemberLocation={onGetMemberLocation}
                onRenderMember={onRenderMember}
                onPick={setPickedRecordId} />
            {notShown > 0 && <span className={styles.more}>{labels.cardGroupMore({ count: `${notShown}` })}</span>}
        </div>
    );
};
