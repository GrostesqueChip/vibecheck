import { jokerDefinitionsById } from "../data/jokers";
import type {
  GameState,
  JokerId,
  JokerTriggerContext,
  JokerTriggerEvent,
  SentimentLabel,
} from "../types/game";

function amplifyEvent(event: JokerTriggerEvent, amplify: boolean) {
  if (!amplify || !event.triggered || event.jokerId === "the-eternal-optimist") {
    return event;
  }

  return {
    ...event,
    multDelta: event.multDelta * 1.5,
    multMultiplier: event.multMultiplier > 1 ? event.multMultiplier * 1.5 : event.multMultiplier,
  };
}

export function hasJoker(state: GameState, jokerId: JokerId) {
  return state.jokers.some((joker) => joker.id === jokerId);
}

export function applyJokerLabelTransforms(
  context: JokerTriggerContext,
  startingLabel: SentimentLabel
) {
  let effectiveLabel = startingLabel;

  for (const joker of context.state.jokers) {
    const definition = jokerDefinitionsById[joker.id];
    const transformed = definition.transformLabel?.({
      ...context,
      effectiveLabel,
    });

    if (transformed) {
      effectiveLabel = transformed;
    }
  }

  return effectiveLabel;
}

export function evaluateJokerEffects(context: JokerTriggerContext) {
  const amplified = hasJoker(context.state, "the-eternal-optimist");
  const events: JokerTriggerEvent[] = [];

  for (const joker of context.state.jokers) {
    const definition = jokerDefinitionsById[joker.id];
    if (!definition.trigger) {
      continue;
    }

    const event = amplifyEvent(definition.trigger(context), amplified);
    events.push(event);
  }

  if (context.state.flags.judgementReady && context.state.flags.judgementTarget) {
    const targetDefinition = jokerDefinitionsById[context.state.flags.judgementTarget];

    if (targetDefinition?.trigger) {
      const echoed = amplifyEvent(targetDefinition.trigger(context), amplified);
      events.push({
        ...echoed,
        label: `Judgement: ${echoed.label}`,
      });
    }
  }

  return events;
}
