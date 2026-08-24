import { DataProvider, EventEmitter, IRawRecord, IRecord } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils/error-handling";
import { ITemplateDataProvider, ITemplateDataProviderEvents } from "./TemplateDataProvider";

//the base class rather than IDataProvider: the interface declares `destroy` as a property, which a
//subclass cannot override with a method
type DataProviderConstructor = new (...args: any[]) => DataProvider;

/** What {@link TemplateDataProviderBase} returns: the base provider, plus the template contract. */
//declared explicitly rather than inferred: a class expression inheriting DataProvider's private
//members cannot be written into a declaration file (TS4094)
export type TemplateDataProviderConstructor<TBase extends DataProviderConstructor> =
    abstract new (...args: any[]) => InstanceType<TBase> & ITemplateDataProvider;

/**
 * Mixin that turns any data provider into an {@link ITemplateDataProvider}, adding the lifecycle events
 * and the error handling around template creation.
 *
 * Extend the result with the base your platform needs and implement `onCreateTemplateFromTask`. The
 * mixin's constructor is untyped (`...args: any[]`), so declare your own typed constructor and forward
 * to `super`.
 *
 * @example
 * ```ts
 * export class MyTemplateDataProvider extends TemplateDataProviderBase(MemoryDataProvider) {
 *     protected async onCreateTemplateFromTask(task: IRecord) {
 *         return captureTemplate(task);
 *     }
 * }
 * ```
 */
export function TemplateDataProviderBase<TBase extends DataProviderConstructor>(Base: TBase): TemplateDataProviderConstructor<TBase> {
    //abstract because the constraint's instance type is the abstract DataProvider; the concrete base
    //passed in supplies the members it declares
    abstract class TemplateDataProviderBase extends Base implements ITemplateDataProvider {
        public readonly templateEvents: EventEmitter<ITemplateDataProviderEvents> = new EventEmitter<ITemplateDataProviderEvents>();

        public async createTemplateFromTask(task: IRecord): Promise<IRawRecord | null> {
            this.templateEvents.dispatchEvent('onBeforeTemplateCreated', task.getRecordId());
            return ErrorHelper.executeWithErrorHandling({
                operation: async () => {
                    const rawRecord = await this.onCreateTemplateFromTask(task);
                    this.templateEvents.dispatchEvent('onAfterTemplateCreated', rawRecord);
                    return rawRecord;
                },
                onError: (error, message) => this.templateEvents.dispatchEvent('onError', error, message)
            });
        }

        public destroy(): void {
            super.destroy();
            this.templateEvents.clearEventListeners();
        }

        /**
         * Captures the template — override this. Return `null` when the operation was cancelled by the
         * user; throw on failure — the base reports both through {@link templateEvents}.
         */
        protected onCreateTemplateFromTask(task: IRecord): Promise<IRawRecord | null> {
            throw new Error(`${this.constructor.name} does not implement onCreateTemplateFromTask.`);
        }
    }
    return TemplateDataProviderBase as unknown as TemplateDataProviderConstructor<TBase>;
}
