import { z } from "zod";

// Define the schema
const hardwareSchema = z.object({
  hardwareName: z.string().min(1, "Hardware Name is required").max(255),
  totalTokens: z.number().min(1, "Total Tokens must be greater than 0"),
  tokenPrice: z.number().min(1, "Token Price must be greater than or equal to 0"),
  hardwareImage: z.any(),
  cpu: z.string().min(1, "CPU is required").max(255),
  memory: z.string().min(1, "Memory is required").max(255),
  location: z.string().min(1, "Location is required").max(255),
});

// Export the schema
export { hardwareSchema };
