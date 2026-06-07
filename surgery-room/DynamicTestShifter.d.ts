export function getDynamicTestShifter(): any;
export class DynamicTestShifter {
    constructor(config?: {});
    mutationStrategies: string[];
    strategyHistory: any[];
    /**
     * Main method to shift tests dynamically
     */
    shiftTests(trigger?: string, options?: {}): Promise<{
        success: boolean;
        strategy: any;
        shiftedCount: number;
        duration: number;
        blockchainHash: any;
        testAnalysis: {
            totalTests: number;
            averageSize: number;
            testFiles: any[];
            failedTests: number;
            metadata: {
                path: any;
                size: any;
                mtime: any;
            }[];
        };
    }>;
    currentStrategy: any;
    /**
     * Analyze the current test suite
     */
    analyzeTestSuite(): Promise<{
        totalTests: number;
        averageSize: number;
        testFiles: any[];
        failedTests: number;
        metadata: {
            path: any;
            size: any;
            mtime: any;
        }[];
    }>;
    /**
     * Calculate risk level based on test analysis
     */
    calculateRiskLevel(testAnalysis: any): "low" | "medium" | "high";
    /**
     * Execute the shifting strategy
     */
    executeShift(strategy: any, testAnalysis: any, options: any): Promise<{
        success: boolean;
        shiftedCount: number;
        strategy: any;
    }>;
    /**
     * Parallel test execution
     */
    parallelShift(tests: any): Promise<any>;
    /**
     * Weighted random distribution
     */
    weightedRandomShift(tests: any): any;
    /**
     * Chaos Monkey - inject random failures
     */
    chaosMonkeyShift(tests: any): Promise<number>;
    /**
     * Canary testing - gradual rollout
     */
    canaryShift(tests: any): Promise<number>;
    /**
     * Blue-Green audit deployment
     */
    blueGreenShift(tests: any): Promise<number>;
    /**
     * ML Predictive ordering
     */
    predictiveShift(tests: any): any;
    /**
     * Adaptive intelligence
     */
    adaptiveShift(tests: any): Promise<number>;
    /**
     * Incremental rollout
     */
    incrementalShift(tests: any): Promise<number>;
    /**
     * Burst execution
     */
    burstShift(tests: any): Promise<number>;
    /**
     * Staggered rollout
     */
    staggeredShift(tests: any): Promise<number>;
    /**
     * A/B testing mode
     */
    abTestingShift(tests: any): Promise<number>;
    /**
     * Circuit breaker pattern
     */
    circuitBreakerShift(tests: any): Promise<number>;
    /**
     * Retry with backoff
     */
    retryShift(tests: any): Promise<any>;
    /**
     * Fallback strategy
     */
    fallbackShift(tests: any): Promise<number>;
    /**
     * Get shift history
     */
    getShiftHistory(): any[];
    /**
     * Get current strategy
     */
    getCurrentStrategy(): any;
    /**
     * Get blockchain ledger
     */
    getBlockchain(): any;
    /**
     * Get available strategies
     */
    getAvailableStrategies(): string[];
    /**
     * Get strategy details
     */
    getStrategyDetails(strategyName: any): any;
    /**
     * Export metrics
     */
    exportMetrics(): {
        version: string;
        totalShifts: number;
        successRate: number;
        currentStrategy: any;
        availableStrategies: number;
        blockchainHeight: any;
        strategyHistory: any[];
    };
}
export default DynamicTestShifter;
//# sourceMappingURL=DynamicTestShifter.d.ts.map