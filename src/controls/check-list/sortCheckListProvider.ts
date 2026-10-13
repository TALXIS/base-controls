import { IDataProvider } from "@talxis/client-libraries";
import type { ICheckListFieldMapping } from "./module/GridCheckList";

/** Sorts the provider by the checklist's `stackRank` column; call it before the provider loads. */
export const sortCheckListProvider = <TProvider extends IDataProvider>(provider: TProvider, fieldMapping: Pick<ICheckListFieldMapping, 'stackRank'>): TProvider => {
    provider.setSorting([{ name: fieldMapping.stackRank, sortDirection: 0 }]);
    return provider;
};
