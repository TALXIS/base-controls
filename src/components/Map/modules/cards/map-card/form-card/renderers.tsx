import { IMapCardRenderers } from '../../cards';
import { FormMapCard } from './FormMapCard';

/**
 * The form renderer, for a host whose card rules use the `form` type.
 *
 * It lives behind its own entry point because it brings the whole Form base control with it: importing this
 * module is what pulls `XrmForm` into the build, so a map whose cards show fields or Adaptive Cards stays light.
 *
 * ```tsx
 * import { FORM_MAP_CARD_RENDERERS } from '@talxis/base-controls/components/Map/modules/cards/map-card/form-card';
 *
 * modules={{ cards: createCardsModule({ renderers: FORM_MAP_CARD_RENDERERS, defaultCard: { type: 'form', formId } }) }}
 * ```
 */
export const FORM_MAP_CARD_RENDERERS: IMapCardRenderers = {
    form: (props) => <FormMapCard {...props} />
};
