import { h } from "preact";
import { actions, ClientAction } from "../actions/index.ts";
import { Action } from "./Action.tsx";

export const ActionSelection = (
  { onSelection }: { onSelection: (action: ClientAction) => void },
) => {
  // TODO: use well ordered categories. E.g.: item, fire, poison, util
  const groups = Object.entries(
    Object.values(actions).reduce((groups, action) => {
      const groupKey = action.name[0];
      const group = groups[groupKey] ?? (groups[groupKey] = []);
      group.push(action);
      return groups;
    }, {} as Record<string, ClientAction[] | undefined>),
  ).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v!);

  return (
    <div
      style={{ position: "absolute", bottom: 150, left: "calc(50% - 24px)" }}
    >
      {groups.map((group) => (
        <div>
          {group.map((action) => (
            <Action
              key={action.name}
              action={action}
              size={48}
              onLeftClick={() => onSelection(action)}
              // TODO: add onRightClick, which allows customizing the action.
              // E.g., with fire bolt, allow the user to specify a cooldown,
              // flat mana, percentage mana (of remaining or total?), and max
              // mana. E.g.,
              // Cooldown: 0.25s
              // Flat mana: 0.1
              // Percent mana: 5% [x] Remaining [ ] Total
              // Max mana: 2.5% [ ] Remaining [x] Total
            />
          ))}
        </div>
      ))}
    </div>
  );
};
