// src/features/prompt-packs/validatePromptPack.ts

export type PromptPackKey =
  | "SYSTEM"
  | "FALLBACK"
  | "GREETINGS"
  | "INTENTION_RULES"
  | "INTENTION_EXAMPLES"
  | "CONVERSATION_SUMMARY"
  | "RESPONSE_PRIORITY"
  | "QUEUE_ROUTING"
  | "REWRITE_SYSTEM"
  | "REWRITE_USER";

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedPlaceholders: string[];
};

type UnknownRecord = Record<string, unknown>;

const BLOCKING_EMPTY_KEYS: PromptPackKey[] = [
  "SYSTEM",
  "FALLBACK",
  "GREETINGS",
  "RESPONSE_PRIORITY",
  "QUEUE_ROUTING",
  "REWRITE_SYSTEM",
  "REWRITE_USER",
  "CONVERSATION_SUMMARY",
  "INTENTION_RULES",
  "INTENTION_EXAMPLES",
];

const REWRITE_USER_REQUIRED_PLACEHOLDERS = [
  "{{language}}",
  "{{style}}",
  "{{message}}",
] as const;

const CONVERSATION_SUMMARY_RECOMMENDED_PLACEHOLDERS = [
  "{{language}}",
  "{{format}}",
  "{{mode}}",
] as const;

const REWRITE_USER_ALLOWED_PLACEHOLDERS = new Set(
  REWRITE_USER_REQUIRED_PLACEHOLDERS,
);

const DANGEROUS_PATTERNS = [
  /ignore\s+as?\s+instru[cç][oõ]es\s+anteriores/i,
  /revele?\s+segred/i,
  /api\s*key/i,
  /token/i,
  /dump\s+do\s+banco/i,
  /prompt\s+do\s+sistema/i,
];

const PLACEHOLDER_REGEX = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function detectPlaceholders(content: string): string[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null = PLACEHOLDER_REGEX.exec(content);

  while (match) {
    found.add(`{{${match[1]}}}`);
    match = PLACEHOLDER_REGEX.exec(content);
  }

  return [...found];
}

function parseJson(content: string): {
  parsed: unknown | null;
  error: string | null;
} {
  try {
    return { parsed: JSON.parse(content), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "JSON inválido.";
    return { parsed: null, error: `JSON inválido: ${message}` };
  }
}

function validateIntentionRulesSchema(parsed: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(parsed)) {
    return ["INTENTION_RULES deve ser um objeto JSON."];
  }

  if (parsed.version !== 1) {
    errors.push("INTENTION_RULES.version deve ser 1.");
  }

  const settings = parsed.settings;
  if (!isRecord(settings)) {
    errors.push("INTENTION_RULES.settings é obrigatório e deve ser objeto.");
  } else {
    if (
      typeof settings.defaultIntent !== "string" ||
      settings.defaultIntent.trim().length === 0
    ) {
      errors.push(
        "INTENTION_RULES.settings.defaultIntent deve ser string não vazia.",
      );
    }
    if (typeof settings.minConfidenceToAccept !== "number") {
      errors.push(
        "INTENTION_RULES.settings.minConfidenceToAccept deve ser number.",
      );
    }
  }

  const intents = parsed.intents;
  if (!Array.isArray(intents)) {
    errors.push("INTENTION_RULES.intents deve ser array.");
  } else {
    intents.forEach((intent, index) => {
      if (!isRecord(intent)) {
        errors.push(`INTENTION_RULES.intents[${index}] deve ser objeto.`);
        return;
      }
      if (typeof intent.name !== "string" || intent.name.trim().length === 0) {
        errors.push(
          `INTENTION_RULES.intents[${index}].name deve ser string não vazia.`,
        );
      }
      if (!isStringArray(intent.strong)) {
        errors.push(
          `INTENTION_RULES.intents[${index}].strong deve ser string[].`,
        );
      }
      if (!isStringArray(intent.weak)) {
        errors.push(
          `INTENTION_RULES.intents[${index}].weak deve ser string[].`,
        );
      }
      if (
        typeof intent.description !== "undefined" &&
        typeof intent.description !== "string"
      ) {
        errors.push(
          `INTENTION_RULES.intents[${index}].description deve ser string quando informado.`,
        );
      }
    });
  }

  const outOfScope = parsed.outOfScope;
  if (!isRecord(outOfScope)) {
    errors.push("INTENTION_RULES.outOfScope é obrigatório e deve ser objeto.");
  } else {
    if (!isStringArray(outOfScope.strong)) {
      errors.push("INTENTION_RULES.outOfScope.strong deve ser string[].");
    }
    if (!isStringArray(outOfScope.weak)) {
      errors.push("INTENTION_RULES.outOfScope.weak deve ser string[].");
    }
  }

  const guards = parsed.guards;
  if (typeof guards !== "undefined") {
    if (!isRecord(guards)) {
      errors.push("INTENTION_RULES.guards deve ser objeto quando informado.");
    } else {
      const guardKeys = [
        "promptInjection",
        "sensitive",
        "humanHandoff",
      ] as const;
      for (const key of guardKeys) {
        const guardValue = guards[key];
        if (typeof guardValue === "undefined") continue;
        if (!isRecord(guardValue)) {
          errors.push(`INTENTION_RULES.guards.${key} deve ser objeto.`);
          continue;
        }
        if (!isStringArray(guardValue.strong)) {
          errors.push(
            `INTENTION_RULES.guards.${key}.strong deve ser string[].`,
          );
        }
        if (!isStringArray(guardValue.weak)) {
          errors.push(`INTENTION_RULES.guards.${key}.weak deve ser string[].`);
        }
      }
    }
  }

  return errors;
}

function validateIntentionExamplesSchema(parsed: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(parsed)) {
    return ["INTENTION_EXAMPLES deve ser um objeto JSON."];
  }

  if (parsed.version !== 1) {
    errors.push("INTENTION_EXAMPLES.version deve ser 1.");
  }

  if (typeof parsed.threshold !== "number") {
    errors.push("INTENTION_EXAMPLES.threshold deve ser number.");
  }

  const intents = parsed.intents;
  if (!isRecord(intents)) {
    errors.push(
      "INTENTION_EXAMPLES.intents deve ser objeto (Record<string, string[]>).",
    );
  } else {
    Object.entries(intents).forEach(([intentName, examples]) => {
      if (!isStringArray(examples)) {
        errors.push(
          `INTENTION_EXAMPLES.intents.${intentName} deve ser string[].`,
        );
      }
    });
  }

  return errors;
}

export function validatePromptPack(
  key: PromptPackKey,
  rawContent: string,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = rawContent.trim();
  const detectedPlaceholders = detectPlaceholders(rawContent);

  if (BLOCKING_EMPTY_KEYS.includes(key) && content.length === 0) {
    errors.push("Conteúdo não pode ficar vazio.");
  }

  if (content.length > 0 && content.length < 20 && key !== "GREETINGS") {
    warnings.push(
      "Conteúdo muito curto; pode degradar a qualidade da resposta.",
    );
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(rawContent)) {
      warnings.push(
        "Foram detectados termos potencialmente perigosos (injeção/prompt leakage). Revise antes de salvar.",
      );
      break;
    }
  }

  if (key === "REWRITE_USER") {
    for (const required of REWRITE_USER_REQUIRED_PLACEHOLDERS) {
      if (!rawContent.includes(required)) {
        errors.push(`Placeholder obrigatório ausente: ${required}`);
      }
    }

    for (const placeholder of detectedPlaceholders) {
      if (!REWRITE_USER_ALLOWED_PLACEHOLDERS.has(placeholder as never)) {
        warnings.push(
          `Placeholder não reconhecido em REWRITE_USER: ${placeholder}`,
        );
      }
    }
  }

  if (key === "CONVERSATION_SUMMARY") {
    for (const recommended of CONVERSATION_SUMMARY_RECOMMENDED_PLACEHOLDERS) {
      if (!rawContent.includes(recommended)) {
        warnings.push(`Placeholder recomendado ausente: ${recommended}`);
      }
    }
  }

  if (key === "INTENTION_RULES") {
    const { parsed, error } = parseJson(content);
    if (error) {
      errors.push(error);
    } else {
      errors.push(...validateIntentionRulesSchema(parsed));
    }
  }

  if (key === "INTENTION_EXAMPLES") {
    const { parsed, error } = parseJson(content);
    if (error) {
      errors.push(error);
    } else {
      errors.push(...validateIntentionExamplesSchema(parsed));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    detectedPlaceholders,
  };
}
