import { IDataProvider } from "@talxis/client-libraries";
import type { IChecklistFieldMapping } from "./modules/checklist/GridChecklist";

/** Sorts the provider by the checklist's `stackRank` column; call it before the provider loads. */
export const sortChecklistProvider = <TProvider extends IDataProvider>(provider: TProvider, fieldMapping: Pick<IChecklistFieldMapping, 'stackRank'>): TProvider => {
    provider.setSorting([{ name: fieldMapping.stackRank, sortDirection: 0 }]);
    return provider;
};
