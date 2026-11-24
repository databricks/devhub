import benchmarkJson from "./data/benchmark.json";
import contentJson from "./data/content.json";
import industryJson from "./data/industry.json";
import { getProviderColor } from "./provider-colors";
import {
  benchmarkDataSchema,
  contentDataSchema,
  industryDataSchema,
} from "./schema";

const benchmark = benchmarkDataSchema.parse(benchmarkJson);
export const benchmarkData = {
  ...benchmark,
  models: benchmark.models.map((model) => ({
    ...model,
    color: getProviderColor(model.vendor, model.color),
  })),
};

export const industryData = industryDataSchema.parse(industryJson);
for (const group of Object.values(industryData.share.groups)) {
  for (const provider of group.providers) {
    provider.color = getProviderColor(provider.name, provider.color);
  }
}

export const contentData = contentDataSchema.parse(contentJson);
