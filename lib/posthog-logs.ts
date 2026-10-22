import { posthog } from "@/lib/posthog";

type PostHogLogAttributes = Record<string, boolean | number | string>;

export const posthogLogs = {
  info: (message: string, attributes?: PostHogLogAttributes) => {
    posthog?.logger.info(message, attributes);
  },
};
