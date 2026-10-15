import { IMemoryProvider, IRecord } from "@talxis/client-libraries";

/** Makes a throwaway provider sort and filter the record instances it is handed instead of building its own. */
export const patchDataBuilderPrepare = (options: { provider: IMemoryProvider; records: IRecord[] }) => {
    const { provider, records } = options;
    //private api of the memory provider
    const dataBuilder: any = (provider as any)._dataBuilder;

    dataBuilder.prepare = function () {
        const topLevelDataProvider = this._dataProvider.getTopLevelDataProvider() as IMemoryProvider;
        topLevelDataProvider.setCustomProperty('blockInternalOnRecordLoaded', true);
        this._allRecords = records;
        this._finalRecords = this._allRecords;
        topLevelDataProvider.setCustomProperty('blockInternalOnRecordLoaded', false);
        return this;
    };
};
