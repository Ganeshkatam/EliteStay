/* eslint-disable */
import fs from 'fs';
import path from 'path';

export interface BenchmarkResult {
  name: string;
  passed: boolean;
  durationMs: number;
  metrics: Record<string, number | string>;
  error?: string;
}

export interface BenchmarkScenario {
  name: string;
  run: () => Promise<BenchmarkResult>;
}

const RESULTS_DIR = path.join(__dirname, 'results');

export async function runBenchmark(
  name: string,
  fn: () => Promise<Omit<BenchmarkResult, 'name' | 'passed' | 'durationMs'>>,
  assertions: (
    result: Omit<BenchmarkResult, 'name' | 'passed' | 'durationMs'>
  ) => void
): Promise<BenchmarkResult> {
  console.log(`\n========================================`);
  console.log(`[START] ${name}`);
  console.log(`========================================`);

  const start = performance.now();

  try {
    const result = await fn();
    const durationMs = performance.now() - start;

    try {
      assertions(result);

      const finalResult: BenchmarkResult = {
        name,
        passed: true,
        durationMs,
        metrics: result.metrics,
      };

      saveResult(name, finalResult);
      console.log(`[PASS] ${name} completed in ${durationMs.toFixed(2)}ms`);
      return finalResult;
    } catch (assertionError: any) {
      const finalResult: BenchmarkResult = {
        name,
        passed: false,
        durationMs,
        metrics: result.metrics,
        error: assertionError.message,
      };

      saveResult(name, finalResult);
      console.error(
        `[FAIL] ${name} failed assertion: ${assertionError.message}`
      );
      return finalResult;
    }
  } catch (executionError: any) {
    const durationMs = performance.now() - start;
    const finalResult: BenchmarkResult = {
      name,
      passed: false,
      durationMs,
      metrics: {},
      error: `Execution Error: ${executionError.message}`,
    };

    saveResult(name, finalResult);
    console.error(`[ERROR] ${name} crashed:`, executionError);
    return finalResult;
  }
}

function saveResult(name: string, result: BenchmarkResult) {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  const filename = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.json';
  fs.writeFileSync(
    path.join(RESULTS_DIR, filename),
    JSON.stringify(result, null, 2)
  );
}

// Helper to calculate percentiles
export function calculatePercentile(
  values: number[],
  percentile: number
): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

export function assertMetric(
  metrics: Record<string, number | string>,
  key: string,
  condition: (val: any) => boolean,
  message: string
) {
  if (!condition(metrics[key])) {
    throw new Error(
      `Assertion failed for ${key}: ${message} (Actual: ${metrics[key]})`
    );
  }
}
