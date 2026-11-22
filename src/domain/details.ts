import { z } from "zod";

export const detailsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
  termsAccepted: z.literal(true),
});
export type Details = z.infer<typeof detailsSchema>;

export interface DetailsDraft {
  name: string;
  email: string;
  termsAccepted: boolean;
}

export const DEFAULT_DETAILS: DetailsDraft = {
  name: "",
  email: "",
  termsAccepted: false,
};

export type DetailsField = "name" | "email" | "termsAccepted";

export function validateDetails(draft: DetailsDraft): {
  ok: true;
  value: Details;
} | {
  ok: false;
  errors: Partial<Record<DetailsField, true>>;
} {
  const parsed = detailsSchema.safeParse(draft);
  if (parsed.success) return { ok: true, value: parsed.data };
  const errors: Partial<Record<DetailsField, true>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (key === "name" || key === "email" || key === "termsAccepted") errors[key] = true;
  }
  return { ok: false, errors };
}
