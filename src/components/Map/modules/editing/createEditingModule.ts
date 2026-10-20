import { useMemo } from 'react';
import { IMapProviderProps } from '../../providers/provider';
import { IMapModule, IMapModuleContext, IMapModuleState, IMapStatusMessage, IMapViewContext, MAP_STATUS_PRIORITY } from '../interfaces';
import { useModuleLabels } from '../useModuleLabels';
import { IMapAddressAttributes } from './addressMapping';
import { editingLabels, IMapEditingTranslations } from './labels';
import { IEditingState, useEditing } from './useEditing';

/** Options for {@link createEditingModule}. Both gestures are off unless asked for. */
export interface IMapEditingModuleOptions {
    /**
     * Whether a pin can be dragged to move its record. Off by default - a map that moves records when a
     * finger slips is worse than one that does not move them at all.
     */
    allowDrag?: boolean;
    /**
     * Whether clicking empty map creates a record there. Off by default. A record the map created carries a
     * delete button on its card, when the cards module is on.
     */
    allowCreate?: boolean;
    /**
     * Attributes the resolved address of a moved or created pin is written to. Every one is optional; with
     * none, only the coordinates are written. Needs a configured provider with a geo-coding service.
     */
    addressAttributes?: IMapAddressAttributes;
    /** Overrides for any subset of the module's strings. */
    labels?: IMapEditingTranslations;
}

/** What the editing module publishes, for the cards module to offer deletion and for the provider props. */
export interface IMapEditingState extends IMapModuleState, IEditingState { }

/** A save in progress outranks everything else the map could be saying. */
const SAVING_PRIORITY = MAP_STATUS_PRIORITY.loading + 40;

const NO_ADDRESS_ATTRIBUTES: IMapAddressAttributes = {};

/**
 * Builds the editing module: the map writes as well as draws. Dropping a dragged pin moves its record, a
 * click on empty map creates one, and where address attributes are given the point is reverse geo-coded
 * and the components written back too. Everything goes through `record.setValue` and `record.save()` on
 * the bound dataset, so the host's own validation and business rules run as they would for a form.
 *
 * Assign it to `modules.editing`:
 *
 * @example
 * ```ts
 * modules={{
 *     editing: createEditingModule({
 *         allowDrag: true,
 *         allowCreate: true,
 *         addressAttributes: { fullAddress: 'cds_address', city: 'cds_city', postalCode: 'cds_zip' }
 *     })
 * }}
 * ```
 */
export const createEditingModule = (options: IMapEditingModuleOptions): IMapModule<IMapEditingState> => {
    const { allowDrag = false, allowCreate = false, addressAttributes = NO_ADDRESS_ATTRIBUTES } = options;

    return {
        useModuleState: (context: IMapModuleContext): IMapEditingState => {
            const editing = useEditing({
                dataset: context.dataset,
                latitudeAttribute: context.coordinateAttributes.latitude,
                longitudeAttribute: context.coordinateAttributes.longitude,
                addressAttributes,
                canDrag: allowDrag,
                canCreate: allowCreate,
                geocoder: context.geocoder,
                language: context.language
            });
            return { ...editing };
        },

        useProviderProps: (props: IMapProviderProps, context: IMapViewContext): IMapProviderProps => {
            const editing = context.read('editing');
            const isPinDraggable = editing?.isPinDraggable;
            const onLocationDragEnd = editing?.onLocationDragEnd;
            const onMapClick = editing?.onMapClick;
            return useMemo(
                () => ({ ...props, isPinDraggable, onLocationDragEnd, onMapClick }),
                [props, isPinDraggable, onLocationDragEnd, onMapClick]
            );
        },

        useStatus: (context: IMapViewContext): IMapStatusMessage | undefined => {
            const labels = useModuleLabels(context, editingLabels, options.labels);
            return context.read('editing')?.isSaving
                ? { message: labels.savingRecord(), isBusy: true, priority: SAVING_PRIORITY }
                : undefined;
        }
    };
};
