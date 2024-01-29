import OpenAI from "openai";
import { CopilotKitServiceAdapter } from "../types/service-adapter";
import { limitOpenAIMessagesToTokenCount, maxTokensForOpenAIModel } from "../utils/openai";

const DEFAULT_MODEL = "gpt-4-1106-preview";

export interface OpenAIAdapterParams {
  openai?: OpenAI;
  model?: string;
}

export class OpenAIAdapter implements CopilotKitServiceAdapter {
  private openai: OpenAI = new OpenAI({});
  private model: string = DEFAULT_MODEL;
  constructor(params?: OpenAIAdapterParams) {
    if (params?.openai) {
      this.openai = params.openai;
    }
    if (params?.model) {
      this.model = params.model;
    }
  }

  stream(forwardedProps: any): ReadableStream {
    const messages = limitOpenAIMessagesToTokenCount(
      forwardedProps.messages || [],
      forwardedProps.functions || [],
      maxTokensForOpenAIModel(forwardedProps.model || DEFAULT_MODEL),
    );

    return this.openai.beta.chat.completions
      .stream({
        model: this.model,
        ...forwardedProps,
        stream: true,
        messages: messages as any,
        ...(forwardedProps.functions.length > 0 ? { functions: forwardedProps.functions } : {}),
      })
      .toReadableStream();
  }
}
