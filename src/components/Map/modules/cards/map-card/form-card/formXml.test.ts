import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadMapCardFormXml } from './formXml';

const setXrm = (xrm: any) => {
    (window as any).Xrm = xrm;
};

afterEach(() => {
    delete (window as any).Xrm;
    vi.restoreAllMocks();
});

describe('loadMapCardFormXml', () => {
    it('returns inline FormXml without asking the host', async () => {
        const retrieveRecord = vi.fn();
        setXrm({ WebApi: { retrieveRecord } });
        await expect(loadMapCardFormXml({ type: 'form', formXml: '<form />', formId: 'abc' })).resolves.toBe('<form />');
        expect(retrieveRecord).not.toHaveBeenCalled();
    });

    it('reads a systemform by id through Xrm.WebApi', async () => {
        const retrieveRecord = vi.fn().mockResolvedValue({ formxml: '<form id="x" />' });
        setXrm({ WebApi: { retrieveRecord } });
        await expect(loadMapCardFormXml({ type: 'form', formId: 'abc' })).resolves.toBe('<form id="x" />');
        expect(retrieveRecord).toHaveBeenCalledWith('systemform', 'abc', '?$select=formxml');
    });

    it('returns nothing for a form id outside a host with Xrm', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        await expect(loadMapCardFormXml({ type: 'form', formId: 'abc' })).resolves.toBeUndefined();
    });

    it('returns nothing when the form cannot be read', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        setXrm({ WebApi: { retrieveRecord: vi.fn().mockRejectedValue(new Error('404')) } });
        await expect(loadMapCardFormXml({ type: 'form', formId: 'abc' })).resolves.toBeUndefined();
    });

    it('returns nothing when neither FormXml nor a form id is given', async () => {
        await expect(loadMapCardFormXml({ type: 'form' })).resolves.toBeUndefined();
    });
});
