import { RealtimeAgent } from "@openai/agents/realtime";

export const realEstateCompanyName = "Dream Homes Realty";

const realEstateBrokerAgent = new RealtimeAgent({
  name: "real_estate_broker",
  voice: "alloy",
  instructions: `You are a friendly real estate broker at ${realEstateCompanyName}.
Help users find their perfect home. Ask about their budget, preferred location, 
number of bedrooms, must-haves, and lifestyle. Be warm and enthusiastic.`,
});

export const realEstateBrokerScenario = [realEstateBrokerAgent];