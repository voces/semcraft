import { useState } from "preact/hooks";
import { Fragment, h } from "preact";
import { actions, ClientAction } from "../actions/index.ts";
import { Action } from "./Action.tsx";

const ActionCustomization = (
  { action, onSelection }: {
    action: ClientAction;
    onSelection: (action: ClientAction) => void;
  },
) => {
  const [cooldown, setCooldown] = useState(
    "cooldown" in action ? action.cooldown : 750,
  );
  const [manas, setManas] = useState(
    "mana" in action ? action.mana : undefined,
  );

  return (
    <div
      style={{ width: "calc(50% - 24px)", textAlign: "right" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "inline-block",
          marginBottom: 6,
          marginRight: 20,
        }}
      >
        <div style={{ fontSize: 30 }}>{action.name}</div>
        <div style={{ fontSize: 20, paddingTop: 12 }}>Cooldown</div>
        <input
          autoFocus
          type="number"
          step="0.05"
          value={cooldown}
          style={{ width: 100 }}
          onInput={(e) =>
            setCooldown(Math.max(0.1, parseFloat(e.currentTarget.value)))}
        />

        {manas &&
          Object.entries(manas).map(([type, amount]) => (
            <Fragment key={type}>
              <div style={{ fontSize: 20, paddingTop: 12 }}>
                {type[0].toUpperCase() + type.slice(1)}
              </div>

              <input
                type="number"
                step="0.05"
                value={amount}
                style={{ width: 100, display: "block" }}
                onInput={(e) =>
                  setManas({
                    ...manas!,
                    [type]: parseFloat(e.currentTarget.value),
                  })}
              />
            </Fragment>
          ))}

        <button
          style={{ marginTop: 12 }}
          onClick={() => {
            "formulate" in action &&
              // Can probably avoid this cast by using generics
              // deno-lint-ignore no-explicit-any
              onSelection(action.formulate(cooldown, manas as any));
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export const ActionSelection = (
  { onSelection }: { onSelection: (action: ClientAction) => void },
) => {
  const [actionToCustomize, setActionToCustomize] = useState<ClientAction>();

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
      style={{
        position: "absolute",
        bottom: 150,
        left: 100,
        width: "calc(100% - 200px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {actionToCustomize
        ? (
          <ActionCustomization
            action={actionToCustomize}
            onSelection={onSelection}
          />
        )
        : <div style={{ width: "calc(50% - 24px)" }} />}
      <div>
        {groups.map((group) => (
          <div>
            {group.map((action) => (
              <Action
                key={action.name}
                action={action}
                size={48}
                onLeftClick={() => onSelection(action)}
                onRightClick={() => {
                  if ("formulate" in action) setActionToCustomize(action);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
