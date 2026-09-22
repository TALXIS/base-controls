import Color from 'color';
import { MemoryCache } from '@talxis/client-libraries/dist/helpers/cache/MemoryCache';

const IsLightColorCache = new MemoryCache<boolean>();

/** Whether text drawn on this colour has to be dark to be read. */
export const isLightColor = (color: string): boolean => {
    return IsLightColorCache.get(color, () => new Color(color).isLight())!;
};
