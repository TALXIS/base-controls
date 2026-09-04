import { IGroupingStrategyModule } from "./interfaces";
import { ServerSideGroupingStrategy } from "./ServerSideGroupingStrategy";

/**
 * Groups by asking for a level when it is opened. Pair it with `createServerSideRowModelModule`.
 *
 * What a grid over a dataset it pages wants: only the levels the user has opened are ever fetched, at the
 * cost of expansion reaching no further than them.
 *
 * @example
 * ```tsx
 * <Grid modules={{
 *     rowModel: createServerSideRowModelModule(),
 *     grouping: createGroupingModule({ strategy: createServerSideGroupingStrategy() }),
 * }} />
 * ```
 */
export const createServerSideGroupingStrategy = (): IGroupingStrategyModule => ({
    rowModel: 'serverSide',
    create: () => new ServerSideGroupingStrategy(),
});
