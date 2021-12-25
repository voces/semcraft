import "./util/livereload.ts";
import { Fragment, h, render } from "preact";
import { useState } from "preact/hooks";
import { precision } from "./util/formatting.ts";

/**
 * Whether data is normalized with mana expenditure (efficiency). Helpful to
 * verify damage curves.
 */
const NORMALIZED = false;

type Spellsheet = {
  inputs: Record<string, number>;
  fn: (manas: number[], affinities: number[]) => Record<string, number>;
};

const firebolt: Spellsheet = {
  inputs: { fire: 0.99, conjuration: 0.01 },
  fn: (manas: number[], affinities: number[]) => {
    const [fire, conjuration] = manas.map((m, i) => m * affinities[i]);

    const speed = ((fire + conjuration) / conjuration) ** 0.5 / 2;
    const physicalDamage = conjuration * (speed / 2) ** 2 * 4;
    const fireDamage = fire * 10;
    const damage = physicalDamage + fireDamage;
    const size = conjuration ** 0.2 / 2;
    const duration = fire ** 0.1 + conjuration ** 0.2 * 6;

    return {
      speed,
      physicalDamage,
      fireDamage,
      damage,
      size,
      duration,
    };
  },
};

const fireball: Spellsheet = {
  inputs: { fire: 0.78, conjuration: 0.02, splash: 0.2 },
  fn: (manas: number[], affinities: number[]) => {
    const [fire, conjuration, splash] = manas.map((m, i) => m * affinities[i]);

    const speed = ((fire + conjuration) / conjuration) ** 0.5 / 2;
    const physicalDamage = conjuration * (speed / 2) ** 2 * 4;
    const fireDamage = fire * 10;
    const damage = physicalDamage + fireDamage;
    const size = conjuration ** 0.2 / 2 + splash ** 0.2 / 10;
    const duration = fire ** 0.1 + conjuration ** 0.2 * 6;
    const splashRadius = 5 * splash ** 0.3;

    return {
      speed,
      physicalDamage,
      fireDamage,
      damage,
      size,
      duration,
      splash: splashRadius,
    };
  },
};

const spells: Record<string, Spellsheet | undefined> = { firebolt, fireball };

const breakpoints = [
  0.01,
  0.025,
  0.05,
  0.1,
  0.25,
  0.5,
  1,
  2.5,
  5,
  10,
  25,
  50,
  100,
  250,
  500,
  1000,
];

// Format numbers to be easily read in a table
const fmt = (v: number) => {
  if (v >= 9.5) return v.toFixed(0).replace("Infinity", "∞");
  return v.toFixed(1).replace("Infinity", "∞");
};

// For colorizaiton
const ra = [0x57, 0xff, 0xe6];
const ga = [0xbb, 0xd6, 0x7c];
const ba = [0x8a, 0x66, 0x76];

const Table = (
  { field, values, spell, a, b }: {
    field: string;
    values: Record<string, number>[][];
    spell: Spellsheet;
    a: string | undefined;
    b: string | undefined;
  },
) => {
  // A quick hack to get the percentile of a given value
  const sorted = values.flatMap((row, i) => row.map((data, n) => data[field]))
    .sort((a, b) => a - b);
  const lookup = Object.fromEntries(
    sorted.map((v, i) => [v, i]),
  );

  // Colorizing cells
  const color = (value: number) => {
    const p1 = lookup[value] / sorted.length;
    const [o, p2] = p1 < 0.5 ? [0, p1 / 0.5] : [1, (p1 - 0.5) / 0.5];
    const r = ra[o] * (1 - p2) + ra[o + 1] * p2;
    const g = ga[o] * (1 - p2) + ga[o + 1] * p2;
    const b = ba[o] * (1 - p2) + ba[o + 1] * p2;

    return `rgb(${r}, ${g}, ${b})`;
  };

  // No variability; just a single value
  if (!a) {
    return (
      <>
        <h2>{field}</h2>
        <table>
          <tr>
            <td>{values[0][0][field]}</td>
          </tr>
        </table>
      </>
    );
  }

  // Only a single variable; render a row
  if (!b) {
    return (
      <>
        <h2>{field}</h2>
        <table>
          <tr>
            <th rowSpan={2}>{a}</th>
            {breakpoints.map((b) => (
              <th key={`${field}-b-${b}`}>{precision(b, 2)}</th>
            ))}
          </tr>
          <tr>
            {values.map((r, i) => (
              <td
                key={`${field}-v-${i}`}
                style={{ background: color(r[0][field]) }}
              >
                {fmt(r[0][field])}
              </td>
            ))}
          </tr>
        </table>
      </>
    );
  }

  return (
    <>
      <h2>{field}</h2>
      <table>
        <tr>
          <th colSpan={2} rowSpan={2}></th>
          <th colSpan={breakpoints.length} style={{ textAlign: "center" }}>
            {b}
          </th>
        </tr>
        <tr>
          {breakpoints.map((b) => (
            <th key={`${field}-c-${b}`}>{precision(b, 2)}</th>
          ))}
        </tr>
        {values.map((row, ri) => (
          <tr key={`${field}-${ri}`}>
            {ri === 0 && (
              <th
                rowSpan={breakpoints.length}
                style={{
                  textAlign: "center",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {a}
              </th>
            )}
            <th key={`${field}-r-${breakpoints[ri]}`}>
              {precision(breakpoints[ri], 2)}
            </th>
            {row.map((value, ci) => (
              <td
                key={`${field}-${ri}-${ci}`}
                style={{ background: color(value[field]) }}
              >
                {fmt(value[field])}
              </td>
            ))}
          </tr>
        ))}
      </table>
    </>
  );
};

const App = () => {
  const spellId = location.hash.slice(1) || "firebolt";
  const spell = spells[spellId];

  const [affinities, setAffinities] = useState<number[]>(
    Array(Object.keys(spell?.inputs ?? {}).length).fill(0.405),
  );
  const [mana, setMana] = useState<(number | "a" | "b")[]>(
    () => [
      "a",
      "b",
      ...Object.values(spell?.inputs ?? {}).slice(2),
    ],
  );

  if (!spell) return <>Invalid spell id</>;

  const values = breakpoints.map((a, i) =>
    breakpoints.map((b, n) => {
      const points = spell.fn(
        mana.map((v) => v === "a" ? a : v === "b" ? b : v),
        affinities,
      );
      if (NORMALIZED) {
        return Object.fromEntries(
          Object.entries(points).map((
            [key, value],
          ) => [key, value / (breakpoints[i] + breakpoints[n])]),
        );
      }
      return points;
    })
  );

  // We'll generate a table for each output
  const keys = Object.keys(values[0][0]);

  return (
    <>
      <div style={{ position: "fixed", right: 16 }}>
        <h2>Affinities</h2>
        {Object.keys(spell.inputs).map((rune, i) => (
          <>
            <h3>{rune}</h3>
            <input
              value={affinities[i]}
              type="number"
              step="0.05"
              min="0"
              max="1"
              style={{ display: "block" }}
              onInput={(e) =>
                setAffinities([
                  ...affinities.slice(0, i),
                  Math.min(Math.max(parseFloat(e.currentTarget.value), 0), 1),
                  ...affinities.slice(i + 1),
                ])}
            />
          </>
        ))}
        <h2>Crosstabs</h2>
        {Object.keys(spell.inputs).map((rune, i) => (
          <>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={typeof mana[i] === "string"}
                onInput={(e) => {
                  if (e.currentTarget.checked) {
                    const prevB = mana.indexOf("b");
                    const next = [...mana];
                    if (prevB >= 0) {
                      next[prevB] = Object.values(spell.inputs)[prevB];
                    }
                    next[i] = mana.includes("a") ? "b" : "a";
                    setMana(next);
                  } else {
                    const next = [...mana];
                    if (next[i] === "a") {
                      const prevB = mana.indexOf("b");
                      if (prevB >= 0) next[prevB] = "a";
                    }
                    next[i] = Object.values(spell.inputs)[i];
                    setMana(next);
                  }
                }}
              />
              <span>{rune}</span>
              {typeof mana[i] !== "string" && (
                <input
                  type="number"
                  style={{ marginLeft: 8, width: 57 }}
                  step="0.05"
                  min="0"
                  value={mana[i]}
                  onInput={(e) =>
                    setMana([
                      ...mana.slice(0, i),
                      parseFloat(e.currentTarget.value),
                      ...mana.slice(i + 1),
                    ])}
                />
              )}
            </label>
          </>
        ))}
      </div>
      <h1>{spellId}</h1>
      {keys.map((key) => (
        <Table
          key={key}
          field={key}
          values={values}
          spell={spell}
          a={Object.keys(spell.inputs)[mana.indexOf("a")]}
          b={Object.keys(spell.inputs)[mana.indexOf("b")]}
        />
      ))}
    </>
  );
};

render(<App />, document.body);
