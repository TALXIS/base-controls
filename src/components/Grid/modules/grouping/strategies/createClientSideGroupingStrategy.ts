import { IGroupingStrategyModule } from "./interfaces";
import { ClientSideGroupingStrategy } from "./ClientSideGroupingStrategy";

/**
 * Groups by fetching every level up front and handing the grid a tree. Pair it with
 * `createClientSideRowModelModule`.
 *
 * Needs a provider that genuinely holds everything: every group at every level is created and refreshed on
 * each load. What it buys is exact expansion — opening by level, or opening all of it, reaches groups
 * nobody has touched.
 *
 * @example
 * ```tsx
 * <Grid modules={{
 *     rowModel: createClientSideRowModelModule(),
 *     grouping: createGroupingModule({ strategy: createClientSideGroupingStrategy() }),
 * }} />
 * ```
 */
export const createClientSideGroupingStrategy = (): IGroupingStrategyModule => ({
    rowModel: 'clientSide',
    create: parameters => new ClientSideGroupingStrategy(parameters),
});
