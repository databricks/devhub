import benchmarkJson from "./data/benchmark.json";
import contentJson from "./data/content.json";
import industryJson from "./data/industry.json";
import {
  benchmarkDataSchema,
  contentDataSchema,
  industryDataSchema,
} from "./schema";

export const benchmarkData = benchmarkDataSchema.parse(benchmarkJson);
export const industryData = industryDataSchema.parse(industryJson);
export const contentData = contentDataSchema.parse(contentJson);
