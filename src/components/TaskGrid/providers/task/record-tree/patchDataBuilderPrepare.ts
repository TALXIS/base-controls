import { IMemoryProvider, IRecord } from "@talxis/client-libraries";
import { DataBuilder } from "@talxis/client-libraries/dist/utils/dataset/data-providers/memory-provider/DataBuilder";

export const patchDataBuilderPrepare = (options: { provider: IMemoryProvider; records: IRecord[] }) => {
    const { provider, records } = options;
    //@ts-ignore - typings
    const dataBuilder: any = provider._dataBuilder;

    dataBuilder.prepare = function () {
        const topLevelDataProvider = this._dataProvider.getTopLevelDataProvider() as IMemoryProvider;
        topLevelDataProvider.setCustomProperty('blockInternalOnRecordLoaded', true);
        this._allRecords = records;
        this._finalRecords = this._allRecords;
        topLevelDataProvider.setCustomProperty('blockInternalOnRecordLoaded', false);
        return this;
    };

}