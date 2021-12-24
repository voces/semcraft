import "./util/livereload.ts";
import { Fragment, h, render } from "preact";
import { precision } from "./util/formatting.ts";

/**
 * Whether data is normalized with mana expenditure (efficiency). Helpful to
 * verify damage curves.
 */
const NORMALIZED = false;

type SpellSheet = {
  inputs: string[];
  fn: (manas: number[], affinities: number[]) => Record<string, number>;
};

const firebolt: SpellSheet = {
  inputs: ["fire", "conjuration"],
  fn: (manas: number[], affinities: number[]) => {
    const [fire, conjuration] = manas.map((m, i) => m * affinities[i]);

    const speed = ((fire + conjuration) / conjuration) ** 0.5 / 2;
    const physicalDamage = conjuration * (speed / 2) ** 2 * 4;
    const fireDamage = fire * 10;
    const damage = physicalDamage + fireDamage;
    const size = conjuration ** 0.4 * 2;
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

const spells: Record<string, SpellSheet | undefined> = { firebolt };

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
  if (v >= 10) return v.toFixed(0);
  return v.toFixed(1);
};

// For colorizaiton
const ra = [0x57, 0xff, 0xe6];
const ga = [0xbb, 0xd6, 0x7c];
const ba = [0x8a, 0x66, 0x76];

const Table = (
  { field, values, spell }: {
    field: string;
    values: Record<string, number>[][];
    spell: SpellSheet;
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

  return (
    <>
      <h2>{field}</h2>
      <table>
        <tr>
          <th colSpan={2} rowSpan={2}></th>
          <th colSpan={breakpoints.length} style={{ textAlign: "center" }}>
            {spell.inputs[1]}
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
                {spell.inputs[0]}
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
  const spellId = location.hash || "firebolt";
  const spell = spells[spellId];

  if (!spell) return <>Invalid spell id</>;

  // TODO: Allow user to specify the varying components
  const values = breakpoints.map((a, i) =>
    breakpoints.map((b, n) => {
      const points = spell.fn([a, b], [1, 1]);
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

  // We'll generate a table for each key
  const keys = Object.keys(values[0][0]);

  return (
    <>
      <h1>{spellId}</h1>
      {keys.map((key) => (
        <Table key={key} field={key} values={values} spell={spell} />
      ))}
    </>
  );
};

render(<App />, document.body);
