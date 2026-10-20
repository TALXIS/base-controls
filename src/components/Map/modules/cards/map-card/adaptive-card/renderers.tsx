import { IMapCardRenderers } from '../../cards';
import { AdaptiveMapCard } from './AdaptiveMapCard';

/**
 * The Adaptive Card renderer, for a host whose card rules use the `adaptiveCard` type.
 *
 * It lives behind its own entry point because `adaptivecards` and `adaptivecards-templating` are optional
 * peer dependencies: importing this module is what pulls them into the build, so a consumer who renders
 * cards from record columns never installs a card engine they do not use.
 *
 * ```tsx
 * import { ADAPTIVE_MAP_CARD_RENDERERS } from '@talxis/base-controls/components/Map/modules/cards/map-card/adaptive-card';
 *
 * modules={{ cards: createCardsModule({ renderers: ADAPTIVE_MAP_CARD_RENDERERS, defaultCard: { type: 'adaptiveCard', template } }) }}
 * ```
 */
export const ADAPTIVE_MAP_CARD_RENDERERS: IMapCardRenderers = {
    adaptiveCard: (props) => <AdaptiveMapCard {...props} />
};
