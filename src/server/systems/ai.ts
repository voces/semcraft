import { DecisionTree } from "../../core/Entity.ts";
import { System } from "../../core/System.ts";

export const newAISystem = () => ({
  props: ["x", "y", "ai", "active"],
  updateChild: (entity) => {
    let cur: DecisionTree["true"] = entity.ai;
    while (cur) {
      cur = cur[cur.check(entity) ? "true" : "false"];

      // Hit a leaf
      if (typeof cur === "function") return cur(entity);
    }
  },
} as System<"x" | "y" | "ai" | "aiActive">);
