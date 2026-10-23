//temporary: a slow backend that fails now and then, to try the loading and error dialog
const SIMULATED_DELAY_MS = 1000;
const SIMULATED_FAILURE_RATE = 0.3;

export const simulateBackend = async (delayMs = SIMULATED_DELAY_MS): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    if (Math.random() < SIMULATED_FAILURE_RATE) {
        throw new Error('The simulated backend failed.');
    }
};
