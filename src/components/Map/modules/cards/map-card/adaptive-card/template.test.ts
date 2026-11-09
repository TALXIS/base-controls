import { describe, expect, it } from 'vitest';
import { renameFormattedValueKeys } from '../../cards';
import { expandAdaptiveCardTemplate, expandSimpleBindings } from './template';

const DATA = renameFormattedValueKeys({
    name: 'Praha depot',
    capacity: 1200,
    'capacity@OData.Community.Display.V1.FormattedValue': '1200 pallets',
    address: { city: 'Praha', postalCode: '190 00' }
});

const PAYLOAD = {
    type: 'AdaptiveCard',
    version: '1.5',
    body: [
        { type: 'TextBlock', text: '${$root.name}' },
        { type: 'TextBlock', text: 'Capacity: ${$root.capacity_label}' },
        { type: 'TextBlock', text: '${$root.address.city}, ${$root.address.postalCode}' },
        { type: 'TextBlock', text: '${$root.nowhere}' }
    ]
};

describe('expandAdaptiveCardTemplate', () => {
    it('binds a record onto a template, formatted values included', () => {
        const expanded = expandAdaptiveCardTemplate(PAYLOAD, DATA) as { body: { text: string }[] };

        expect(expanded.body[0].text).toBe('Praha depot');
        expect(expanded.body[1].text).toBe('Capacity: 1200 pallets');
        expect(expanded.body[2].text).toBe('Praha, 190 00');
    });

    it('leaves a binding it cannot resolve as written, rather than blanking it', () => {
        const expanded = expandAdaptiveCardTemplate(PAYLOAD, DATA) as { body: { text: string }[] };
        expect(expanded.body[3].text).toBe('${$root.nowhere}');
    });

    it('leaves the rest of the payload alone', () => {
        const expanded = expandAdaptiveCardTemplate(PAYLOAD, DATA) as { type: string; version: string };
        expect(expanded.type).toBe('AdaptiveCard');
        expect(expanded.version).toBe('1.5');
    });
});

describe('expandSimpleBindings', () => {
    it('substitutes the same bindings the engine would, so the fallback matches where it overlaps', () => {
        const viaEngine = expandAdaptiveCardTemplate(PAYLOAD, DATA);
        const viaFallback = expandSimpleBindings(PAYLOAD, DATA);
        expect(viaFallback).toEqual(viaEngine);
    });

    it('accepts a binding with no prefix, and one written against $data', () => {
        expect(expandSimpleBindings({ a: '${name}', b: '${$data.name}' }, DATA))
            .toEqual({ a: 'Praha depot', b: 'Praha depot' });
    });

    it('substitutes several bindings inside one string', () => {
        expect(expandSimpleBindings('${$root.name} holds ${$root.capacity}', DATA))
            .toBe('Praha depot holds 1200');
    });

    it('walks arrays and nested objects', () => {
        const expanded = expandSimpleBindings({
            body: [{ facts: [{ title: 'City', value: '${$root.address.city}' }] }]
        }, DATA);
        expect(expanded.body[0].facts[0].value).toBe('Praha');
    });

    it('leaves values that are not strings alone', () => {
        expect(expandSimpleBindings({ n: 3, b: true, z: null }, DATA)).toEqual({ n: 3, b: true, z: null });
    });

    it('tolerates a path reaching through something that is not there', () => {
        expect(expandSimpleBindings('${$root.address.country.code}', DATA)).toBe('${$root.address.country.code}');
    });
});
