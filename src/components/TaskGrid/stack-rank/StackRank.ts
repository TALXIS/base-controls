import { LexoRank } from "lexorank";

/**
 * The lexicographic rank scheme both shipped task strategies order by — a string per task, chosen so a
 * reorder rewrites one record instead of renumbering the list.
 *
 * Nothing in the grid requires it. The data provider resolves *which records* an operation lands between
 * and hands them over as `previousStackRank` / `nextStackRank`; how order is expressed is the strategy's
 * decision. Call this when you want the shipped scheme:
 *
 * ```ts
 * onMoveTask: async params => {
 *     const stackRank = StackRank.between(params.previousStackRank, params.nextStackRank);
 *     …
 * }
 * ```
 *
 * A strategy that orders by a server sequence or a numeric column simply never imports it, and
 * `lexorank` stays out of its bundle.
 */
export class StackRank {
    /**
     * A rank that sorts strictly between two neighbours.
     *
     * Both given: bisected between them, so it can never equal either. One given: a step beyond it —
     * safe, because there is no neighbour on the other side to collide with. Neither: the middle of the
     * range, for the first record in a list.
     */
    public static between(previousRank?: string | null, nextRank?: string | null): string {
        if (previousRank && nextRank) {
            return LexoRank.parse(previousRank).between(LexoRank.parse(nextRank)).format();
        }
        if (previousRank) {
            return LexoRank.parse(previousRank).genNext().format();
        }
        if (nextRank) {
            return LexoRank.parse(nextRank).genPrev().format();
        }
        return LexoRank.middle().format();
    }

    /**
     * Compares two ranks the way the grid sorts them, for ordering a sibling list yourself. Records with
     * no rank sort last.
     *
     * @returns A negative number when `previousRank` sorts first, positive when it sorts later, `0` when
     * they are equivalent.
     */
    public static compare(previousRank?: string | null, nextRank?: string | null): number {
        if (!previousRank || !nextRank) {
            //a missing rank cannot be placed, so it goes to the end
            return previousRank ? -1 : nextRank ? 1 : 0;
        }
        return LexoRank.parse(previousRank).compareTo(LexoRank.parse(nextRank));
    }
}
