import type { IRuntime, RuntimeLifecycle } from "./RuntimeLifecycle";
import { RuntimeExecutor } from "./RuntimeExecutor";
import { RuntimeLoading } from "./RuntimeLoading";

/** What a runtime is built on: the loading and executor beside its own lifecycle. */
export abstract class Runtime implements IRuntime {
    public abstract readonly lifecycle: RuntimeLifecycle;
    public readonly loading = new RuntimeLoading();
    public readonly executor = new RuntimeExecutor({ loading: this.loading });
    public readonly execute = this.executor.execute.bind(this.executor);
}
