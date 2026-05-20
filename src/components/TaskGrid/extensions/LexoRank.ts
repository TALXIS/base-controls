const LEXO_MIN = 'aaaaaaa';
const LEXO_MAX = 'zzzzzzz';
const ALPHA_SIZE = 26;
const ALPHA_BASE = 'a'.charCodeAt(0);

export class LexoRank {
    public static readonly MIN = LEXO_MIN;
    public static readonly MAX = LEXO_MAX;

    public static between(lo: string, hi: string): string {
        let a = lo, b = hi;
        while (a.length < b.length) a += 'a';
        while (b.length < a.length) b += 'a';

        const aCodes = Array.from(a).map(c => c.charCodeAt(0) - ALPHA_BASE);
        const bCodes = Array.from(b).map(c => c.charCodeAt(0) - ALPHA_BASE);

        let difference = 0;
        for (let i = aCodes.length - 1; i >= 0; i--) {
            let aCode = aCodes[i];
            let bCode = bCodes[i];
            if (bCode < aCode) {
                bCode += ALPHA_SIZE;
                bCodes[i - 1] -= 1;
            }
            difference += (bCode - aCode) * Math.pow(ALPHA_SIZE, a.length - i - 1);
        }

        if (difference <= 1) {
            return lo + 'n';
        }

        difference = Math.floor(difference / 2);
        let result = '';
        let offset = 0;
        for (let i = 0; i < a.length; i++) {
            const diffInSymbols = Math.floor(difference / Math.pow(ALPHA_SIZE, i)) % ALPHA_SIZE;
            let newCode = a.charCodeAt(a.length - i - 1) - ALPHA_BASE + diffInSymbols + offset;
            offset = 0;
            if (newCode >= ALPHA_SIZE) {
                offset++;
                newCode -= ALPHA_SIZE;
            }
            result += String.fromCharCode(ALPHA_BASE + newCode);
        }
        return result.split('').reverse().join('');
    }

    public static before(rank: string): string {
        if (rank <= LEXO_MIN) {
            return rank + 'n';
        }
        return LexoRank.between(LEXO_MIN, rank);
    }
    public static after(rank: string): string {
        if (rank >= LEXO_MAX) {
            return rank + 'n';
        }
        return LexoRank.between(rank, LEXO_MAX);
    }
}
