/** Runs an action whose failure `execute` has already shown. */
export const runQuietly = async (operation: () => Promise<unknown>): Promise<void> => {
    try {
        await operation();
    }
    catch { }
};
