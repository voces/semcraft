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
            />
          ))}
        </div>
      ))}
    </div>
  );
};
