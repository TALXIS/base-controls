import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { getTheme } from '@fluentui/react';
import { IMapCardsLabels } from '../labels';
import { IMapLocation } from '../../../providers/provider';
import { createFakeRecord } from '../../../testing/records';
import { MapClusterCard } from './MapClusterCard';

const labels = {
    cardGroup: ({ count }: { count: string }) => `${count} records here`,
    cardGroupMore: ({ count }: { count: string }) => `and ${count} more`,
    cardZoomIn: () => 'Zoom in',
    cardBack: () => 'Back to the list'
} as unknown as IMapCardsLabels;

const records = [
    createFakeRecord({ id: 'r1', name: 'Alpha', rawData: { name: 'Alpha' } }),
    createFakeRecord({ id: 'r2', name: 'Beta', rawData: { name: 'Beta' } })
];
const locations = new Map<string, IMapLocation>([
    ['r1', { id: 'r1', latitude: 50, longitude: 14, pin: { color: '#ff0000' } }],
    ['r2', { id: 'r2', latitude: 50, longitude: 14, pin: { svg: '<svg xmlns="http://www.w3.org/2000/svg"/>', width: 30, height: 40 } }]
]);

const renderCard = () => {
    const onRenderRecordCard = vi.fn((record) => <div data-testid="record-card">{record.getRecordId()}</div>);
    render(
        <MapClusterCard
            cluster={{ count: 5, recordIds: ['r1', 'r2'], expansionZoom: 12 }}
            records={records}
            labels={labels}
            theme={getTheme()}
            onGetMemberLocation={(record) => locations.get(record.getRecordId())}
            onRenderRecordCard={onRenderRecordCard}
            onZoomIn={() => { }} />
    );
    return { onRenderRecordCard };
};

describe('MapClusterCard', () => {
    afterEach(cleanup);

    it('lists a row per member and renders no member card until one is picked', () => {
        const { onRenderRecordCard } = renderCard();
        expect(screen.getByText('5 records here')).toBeTruthy();
        expect(screen.getByRole('button', { name: /Alpha/ })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Beta/ })).toBeTruthy();
        expect(screen.getByText('and 3 more')).toBeTruthy();
        expect(screen.queryByTestId('record-card')).toBeNull();
        expect(onRenderRecordCard).not.toHaveBeenCalled();
    });

    it('draws each row with the member\'s own pin', () => {
        renderCard();
        const swatches = screen.getAllByRole('button').flatMap((button) => Array.from(button.querySelectorAll('img')));
        expect(swatches).toHaveLength(2);
        expect(swatches[0].getAttribute('src')).toContain('data:image/svg+xml');
        //a pin with proportions keeps them at swatch size
        expect(swatches[1].style.width).toBe('15px');
    });

    it('shows only the picked member\'s card, and the list again from its back button', () => {
        const { onRenderRecordCard } = renderCard();
        fireEvent.click(screen.getByRole('button', { name: /Beta/ }));
        expect(screen.getByTestId('record-card').textContent).toBe('r2');
        expect(onRenderRecordCard).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', { name: /Alpha/ })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Back to the list' }));
        expect(screen.queryByTestId('record-card')).toBeNull();
        expect(screen.getByRole('button', { name: /Alpha/ })).toBeTruthy();
    });
});
