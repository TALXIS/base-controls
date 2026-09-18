import { IGroupingStrategyModule } from "./interfaces";
import { ServerSideGroupingStrategy } from "./ServerSideGroupingStrategy";

/**
 * Groups by asking for a level when it is opened.
 *
 * @example
 */
export const createServerSideGroupingStrategy = (): IGroupingStrategyModule => ({
    rowModel: 'serverSide',
    create: () => new ServerSideGroupingStrategy(),
});
