import { LexoRank } from "lexorank";

/** The lexicographic ranks the task grid orders siblings by, resolved by the provider and saved by stores. */
export class StackRank {
    /**
     * A rank that sorts strictly between two neighbours. With one neighbour, a step beyond it; with
     * neither, the middle of the range.
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
     * Compares two ranks the way the grid sorts them. Records with no rank sort last.
     *
     * @returns Negative when `previousRank` sorts first, positive when it sorts later, `0` when equivalent.
     */
    public static compare(previousRank?: string | null, nextRank?: string | null): number {
        if (!previousRank || !nextRank) {
            //a missing rank cannot be placed, so it goes to the end
            return previousRank ? -1 : nextRank ? 1 : 0;
        }
        return LexoRank.parse(previousRank).compareTo(LexoRank.parse(nextRank));
    }
}
