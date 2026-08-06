export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { bootstrapNode } = await import('./bootstrap/node');
    bootstrapNode();
    return;
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { bootstrapEdge } = await import('./bootstrap/edge');
    bootstrapEdge();
  }
}
