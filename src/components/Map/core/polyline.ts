import { IMapCoordinates } from './coordinates';

/** Alphabet HERE's flexible polyline encodes its six bit values with. The dash is 62 and the underscore 63. */
const FLEXIBLE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Version byte every flexible polyline starts with. Anything else is a format this decoder does not know. */
const FLEXIBLE_VERSION = 1;

/** Continuation bit both encodings use to mark that a value carries on into the next character. */
const CONTINUATION_BIT = 0x20;

/** Mask of the five value bits each character of either encoding carries. */
const VALUE_MASK = 0x1f;

/** Offset Google's encoded polyline adds to every character so the result stays printable ASCII. */
const ASCII_OFFSET = 63;

/**
 * Undoes the zigzag encoding both formats apply, which maps signed numbers onto unsigned ones. Arithmetic
 * rather than bit operations throughout, because a coordinate scaled to seven decimal places overflows the
 * 32 bits JavaScript bit operators work in.
 */
const decodeZigzag = (value: number): number => (value % 2 === 1 ? -(value + 1) / 2 : value / 2);

/** Reads the unsigned values out of an encoded string, one variable length integer at a time. */
const readVarints = (encoded: string, toCharValue: (character: string) => number): number[] => {
    const values: number[] = [];
    let value = 0;
    let multiplier = 1;
    for (const character of encoded) {
        const charValue = toCharValue(character);
        if (charValue < 0) {
            throw new Error(`Unexpected character "${character}" in an encoded polyline.`);
        }
        value += (charValue & VALUE_MASK) * multiplier;
        if (charValue & CONTINUATION_BIT) {
            multiplier *= 32;
            continue;
        }
        values.push(value);
        value = 0;
        multiplier = 1;
    }
    return values;
};

/**
 * Decodes a Google encoded polyline into coordinates. Used by the Routes API and by every service that
 * adopted the same format. `precision` is the decimal places the coordinates were scaled to; Google uses
 * five.
 */
export const decodeEncodedPolyline = (encoded: string, precision = 5): IMapCoordinates[] => {
    if (!encoded) {
        return [];
    }
    const values = readVarints(encoded, (character) => character.charCodeAt(0) - ASCII_OFFSET);
    const scale = Math.pow(10, precision);
    const coordinates: IMapCoordinates[] = [];
    let latitude = 0;
    let longitude = 0;
    for (let index = 0; index + 1 < values.length; index += 2) {
        latitude += decodeZigzag(values[index]);
        longitude += decodeZigzag(values[index + 1]);
        coordinates.push({ latitude: latitude / scale, longitude: longitude / scale });
    }
    return coordinates;
};

/**
 * Decodes a HERE flexible polyline into coordinates. The format carries its own precision in a header, and
 * optionally a third dimension - elevation, say - which is read past and dropped, since the control draws
 * in two dimensions.
 */
export const decodeFlexiblePolyline = (encoded: string): IMapCoordinates[] => {
    if (!encoded) {
        return [];
    }
    const values = readVarints(encoded, (character) => FLEXIBLE_ALPHABET.indexOf(character));
    if (values.length < 2) {
        return [];
    }
    const [version, header] = values;
    if (version !== FLEXIBLE_VERSION) {
        throw new Error(`Unsupported flexible polyline version ${version}.`);
    }
    const precision = header & 15;
    const thirdDimension = (header >> 4) & 7;
    const stride = thirdDimension ? 3 : 2;
    const scale = Math.pow(10, precision);

    const coordinates: IMapCoordinates[] = [];
    let latitude = 0;
    let longitude = 0;
    for (let index = 2; index + stride - 1 < values.length; index += stride) {
        latitude += decodeZigzag(values[index]);
        longitude += decodeZigzag(values[index + 1]);
        coordinates.push({ latitude: latitude / scale, longitude: longitude / scale });
    }
    return coordinates;
};
