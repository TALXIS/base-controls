import { IRuntime, RuntimeLifecycle } from "./RuntimeLifecycle";
import { RuntimeExecutor } from "./RuntimeExecutor";
import { RuntimeLoading } from "./RuntimeLoading";

/** What a runtime is built on: its lifecycle, loading and executor. */
export abstract class Runtime implements IRuntime {
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this.onInit(), onDestroy: () => this.onDestroy() });
    public readonly loading = new RuntimeLoading({ lifecycle: this.lifecycle });
    public readonly executor = new RuntimeExecutor({ loading: this.loading });
    public readonly execute = this.executor.execute.bind(this.executor);

    /** Prepares what the control needs before it is drawn; the host runs it once per mount. */
    protected abstract onInit(): Promise<void>;
    /** Releases what the runtime holds, after `onDestroyed`. */
    protected abstract onDestroy(): void;
}
