import { Entity } from "../core/Entity.ts";
import { addPoison } from "./util.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("addPoison", async (t) => {
  await t.step("first", () => {
    const entity: Entity = { entityId: 0 };
    addPoison(entity, 5, 7);

    assertEquals(entity.poisons, [{ damage: 5, remaining: 7 }]);
  });

  await t.step("insertion", async (t) => {
    await t.step("would expire before coming into effect", () => {
      const entity: Entity = {
        entityId: 0,
        poisons: [{ damage: 7, remaining: 3 }, { damage: 5, remaining: 5 }],
      };
      addPoison(entity, 6, 3);

      assertEquals(entity.poisons, [
        { damage: 7, remaining: 3 },
        { damage: 5, remaining: 5 },
      ]);
    });

    await t.step("inserts in middle", () => {
      const entity: Entity = {
        entityId: 0,
        poisons: [
          { damage: 7, remaining: 3 },
          { damage: 5, remaining: 5 },
          { damage: 4, remaining: 1 },
        ],
      };
      addPoison(entity, 6, 4);

      assertEquals(entity.poisons, [
        { damage: 7, remaining: 3 },
        { damage: 6, remaining: 1 },
        { damage: 5, remaining: 4 },
      ]);
    });
  });

  await t.step("append", () => {
    const entity: Entity = {
      entityId: 0,
      poisons: [{ damage: 7, remaining: 3 }, { damage: 5, remaining: 5 }],
    };
    addPoison(entity, 4, 10);

    assertEquals(entity.poisons, [
      { damage: 7, remaining: 3 },
      { damage: 5, remaining: 5 },
      { damage: 4, remaining: 2 },
    ]);
  });

  await t.step("update", () => {
    const entity: Entity = {
      entityId: 0,
      poisons: [
        { damage: 6, remaining: 3 },
        { damage: 5, remaining: 2 },
        { damage: 4, remaining: 3 },
        { damage: 3, remaining: 2 },
      ],
    };
    addPoison(entity, 5, 7);

    assertEquals(entity.poisons, [
      { damage: 6, remaining: 3 },
      { damage: 5, remaining: 4 },
      { damage: 4, remaining: 1 },
    ]);
  });
});
