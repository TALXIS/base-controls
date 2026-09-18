import { SAMPLE_ATTRIBUTES } from './mapSampleData'

/** Depots red, service points green, everything else blue - the pin rules a maker would type into the manifest. */
export const PIN_RULES = JSON.stringify([
    { attributeName: SAMPLE_ATTRIBUTES.category, value: 'depot', color: '#c50f1f' },
    { attributeName: SAMPLE_ATTRIBUTES.category, value: 'service', color: '#107c10' },
    { color: '#0f6cbd' }
], null, 2)
