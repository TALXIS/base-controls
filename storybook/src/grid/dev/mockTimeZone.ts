/**
 * Makes `Date` and `Intl.DateTimeFormat` behave as if the browser were in another time zone.
 *
 * A page cannot change the zone the browser runs in, so the local parts of a date (`getHours`, the
 * constructor taking a year and month, `getTimezoneOffset`) are worked out for the zone through `Intl`.
 * dayjs, the Fluent calendar and the formatting all read dates through those, so they all follow.
 *
 * @returns A function that puts the browser's own `Date` and `Intl.DateTimeFormat` back.
 */
export const mockTimeZone = (timeZone: string): (() => void) => {
    const OriginalDate = Date
    const OriginalDateTimeFormat = Intl.DateTimeFormat
    const prototype = OriginalDate.prototype
    const originals = Object.fromEntries(LOCAL_METHODS.map(name => [name, (prototype as any)[name]]))

    const zoneFormat = new OriginalDateTimeFormat('en-US', {
        timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
    })
    const offsets = new Map<number, number>()

    //minutes the zone is ahead of UTC at an instant, the same within any quarter of an hour
    const getOffset = (time: number): number => {
        const bucket = Math.floor(time / 900000)
        let offset = offsets.get(bucket)
        if (offset === undefined) {
            const parts = Object.fromEntries(zoneFormat.formatToParts(new OriginalDate(bucket * 900000)).map(part => [part.type, Number(part.value)]))
            offset = Math.round((OriginalDate.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - bucket * 900000) / 60000)
            offsets.set(bucket, offset)
        }
        return offset
    }

    //the instant a wall clock in the zone stands for, resolved the way a browser resolves its own zone
    const fromWallClock = (wallClock: number): number => {
        const guess = wallClock - getOffset(wallClock) * 60000
        const before = getOffset(guess - 3 * 3600000)
        const after = getOffset(guess + 3 * 3600000)
        const earlier = wallClock - before * 60000
        const later = wallClock - after * 60000
        const valid = [earlier, later].filter(time => getOffset(time) === (time === earlier ? before : after))
        //a repeated time is its first occurrence, a skipped one moves forward by the gap
        return valid.length > 0 ? Math.min(...valid) : earlier
    }

    const getWallClock = (date: Date) => new OriginalDate(date.getTime() + getOffset(date.getTime()) * 60000)

    const fromParts = (year: number, month: number, day = 1, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) => {
        const wallClock = new OriginalDate(0)
        wallClock.setUTCFullYear(year, month, day)
        wallClock.setUTCHours(hours, minutes, seconds, milliseconds)
        return fromWallClock(wallClock.getTime())
    }

    //strings without a zone are local, except a bare ISO date, which is UTC
    const parse = (text: string): number => {
        const iso = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(text.trim())
        if (iso) {
            const [, year, month, day, hours, minutes, seconds, milliseconds] = iso.map(Number)
            return fromParts(year, month - 1, day, hours, minutes, seconds || 0, milliseconds || 0)
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(text.trim()) || /(Z|[+-]\d{2}:?\d{2}|GMT|UTC)/i.test(text)) {
            return OriginalDate.parse(text)
        }
        const system = new OriginalDate(OriginalDate.parse(text))
        return isNaN(system.getTime()) ? NaN : fromParts(originals.getFullYear.call(system), originals.getMonth.call(system), originals.getDate.call(system), originals.getHours.call(system), originals.getMinutes.call(system), originals.getSeconds.call(system), originals.getMilliseconds.call(system))
    }

    class ZonedDate extends OriginalDate {
        constructor(...args: any[]) {
            if (args.length === 0) {
                super()
            }
            else if (args.length === 1) {
                super(typeof args[0] === 'string' ? parse(args[0]) : args[0] instanceof OriginalDate ? args[0].getTime() : args[0])
            }
            else {
                super(fromParts(...(args as [number, number])))
            }
        }

        //dates made before the mock are dates too
        static [Symbol.hasInstance](value: unknown) {
            return value instanceof OriginalDate
        }

        static parse(text: string) {
            return parse(text)
        }
    }

    const getters: { [name: string]: (wallClock: Date) => number } = {
        getFullYear: wallClock => wallClock.getUTCFullYear(),
        getMonth: wallClock => wallClock.getUTCMonth(),
        getDate: wallClock => wallClock.getUTCDate(),
        getDay: wallClock => wallClock.getUTCDay(),
        getHours: wallClock => wallClock.getUTCHours(),
        getMinutes: wallClock => wallClock.getUTCMinutes(),
        getSeconds: wallClock => wallClock.getUTCSeconds(),
        getMilliseconds: wallClock => wallClock.getUTCMilliseconds(),
    }
    for (const [name, read] of Object.entries(getters)) {
        (prototype as any)[name] = function (this: Date) {
            return read(getWallClock(this))
        }
    }
    prototype.getTimezoneOffset = function (this: Date) {
        return -getOffset(this.getTime())
    }

    //a setter writes the wall clock and finds the instant it now stands for
    const setters: { [name: string]: string } = {
        setFullYear: 'setUTCFullYear',
        setMonth: 'setUTCMonth',
        setDate: 'setUTCDate',
        setHours: 'setUTCHours',
        setMinutes: 'setUTCMinutes',
        setSeconds: 'setUTCSeconds',
        setMilliseconds: 'setUTCMilliseconds',
    }
    for (const [name, utcName] of Object.entries(setters)) {
        (prototype as any)[name] = function (this: Date, ...args: number[]) {
            const wallClock = getWallClock(this);
            (wallClock as any)[utcName](...args)
            return this.setTime(fromWallClock(wallClock.getTime()))
        }
    }

    const formatInZone = (date: Date, options: Intl.DateTimeFormatOptions) => new OriginalDateTimeFormat('en-US', { ...options, timeZone }).format(date)
    prototype.toString = function (this: Date) {
        if (isNaN(this.getTime())) {
            return 'Invalid Date'
        }
        const offset = getOffset(this.getTime())
        const sign = offset < 0 ? '-' : '+'
        const zone = `GMT${sign}${`${Math.floor(Math.abs(offset) / 60)}`.padStart(2, '0')}${`${Math.abs(offset) % 60}`.padStart(2, '0')}`
        return `${formatInZone(this, { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })} ${zone} (${timeZone})`
    }
    prototype.toDateString = function (this: Date) {
        return formatInZone(this, { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })
    }
    prototype.toTimeString = function (this: Date) {
        return formatInZone(this, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
    }
    for (const name of ['toLocaleString', 'toLocaleDateString', 'toLocaleTimeString'] as const) {
        (prototype as any)[name] = function (this: Date, locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
            return originals[name].call(this, locales, { ...options, timeZone: options?.timeZone ?? timeZone })
        }
    }

    const ZonedDateTimeFormat: any = function (locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
        return new OriginalDateTimeFormat(locales, { ...options, timeZone: options?.timeZone ?? timeZone })
    }
    ZonedDateTimeFormat.prototype = OriginalDateTimeFormat.prototype
    ZonedDateTimeFormat.supportedLocalesOf = OriginalDateTimeFormat.supportedLocalesOf

    window.Date = ZonedDate as DateConstructor
    Intl.DateTimeFormat = ZonedDateTimeFormat

    return () => {
        for (const name of LOCAL_METHODS) {
            (prototype as any)[name] = originals[name]
        }
        window.Date = OriginalDate
        Intl.DateTimeFormat = OriginalDateTimeFormat
    }
}

const LOCAL_METHODS = [
    'getFullYear', 'getMonth', 'getDate', 'getDay', 'getHours', 'getMinutes', 'getSeconds', 'getMilliseconds', 'getTimezoneOffset',
    'setFullYear', 'setMonth', 'setDate', 'setHours', 'setMinutes', 'setSeconds', 'setMilliseconds',
    'toString', 'toDateString', 'toTimeString', 'toLocaleString', 'toLocaleDateString', 'toLocaleTimeString',
] as const
