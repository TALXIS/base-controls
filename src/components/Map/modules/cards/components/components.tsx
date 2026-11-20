import { IMapClusterMemberProps } from '../cards';
import { MapClusterMemberRow } from '../map-cluster-card/map-cluster-member-row';

/** The replaceable parts of the cards module's UI. Override any subset through the module's `components` option. */
export interface IMapCardsComponents {
    /**
     * One row of the list a grouped pin opens. The default row is the record's pin and primary name; a host
     * shows what tells its records apart instead. A record's full card opens only once its row is picked.
     */
    onRenderClusterMember: (props: IMapClusterMemberProps) => JSX.Element;
}

/** The defaults for {@link IMapCardsComponents}. */
export const MapCardsComponents: IMapCardsComponents = {
    onRenderClusterMember: (props) => <MapClusterMemberRow {...props} />
};
