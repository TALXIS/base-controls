import { IGroupingStrategyModule } from "./interfaces";
import { ClientSideGroupingStrategy } from "./ClientSideGroupingStrategy";

/**
 * Groups by fetching every level up front and handing the grid a tree.
 *
 * @example
 */
export const createClientSideGroupingStrategy = (): IGroupingStrategyModule => ({
    rowModel: 'clientSide',
    create: parameters => new ClientSideGroupingStrategy(parameters),
});
