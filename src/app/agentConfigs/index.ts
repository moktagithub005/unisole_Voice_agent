import { indianStockAdvisorScenario } from './indianStockAdvisor';
import type { RealtimeAgent } from '@openai/agents/realtime';

// Map of scenario key -> array of RealtimeAgent objects (single scenario after refactor)
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  indianStockAdvisor: indianStockAdvisorScenario,
};

export const defaultAgentSetKey = 'indianStockAdvisor';
