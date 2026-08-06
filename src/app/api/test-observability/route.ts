import { NextResponse } from 'next/server';
import { instrumentExecution } from '@/lib/observability/instrumentation/instrumentation';
import { RequestContext } from '@/lib/observability/context/request-context';

export const dynamic = 'force-dynamic';

export async function GET() {
  return instrumentExecution('TestRoute', 'SERVICE', async () => {
    // Simulate a service call
    await instrumentExecution('TestService', 'SERVICE', async () => {
      // Simulate a repository call
      await instrumentExecution('TestRepository', 'DATABASE', async () => {
        // Just delay
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      const trace = RequestContext.getActiveTrace();
      const parent = RequestContext.getActiveSpan();
      console.log(
        'Inside TestService. TraceID:',
        trace?.traceId,
        'SpanID:',
        parent?.spanId
      );
    });

    const trace = RequestContext.getActiveTrace();
    console.log(
      'Inside TestRoute. Trace Spans:',
      JSON.stringify(trace?.rootSpan, null, 2)
    );

    return NextResponse.json({ success: true, traceId: trace?.traceId });
  });
}
