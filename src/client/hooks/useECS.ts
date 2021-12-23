import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import { Entity } from "../../core/Entity.ts";
import { SemcraftContext } from "../contexts/SemcraftContext.ts";

export const useECS = <T extends keyof Entity>(props: ReadonlyArray<T>) => {
  const [data, setData] = useState(
    new Map<Entity["entityId"], Required<Pick<Entity, T>>>(),
  );
  const semcraft = useContext(SemcraftContext);

  const updateData = useCallback(
    (entity: Entity & Required<Pick<Entity, T>>) =>
      setData((data) => {
        const newData = new Map(data);
        newData.set(
          entity.entityId,
          Object.fromEntries(
            props.map((prop) => [prop, entity[prop]]),
          ) as unknown as Required<Pick<Entity, T>>,
        );
        return newData;
      }),
    [],
  );

  useEffect(() => {
    const system = semcraft.addSystem({
      props,
      onAdd: updateData,
      onChange: updateData,
      onRemove: (entity) => {
        const newData = new Map(data);
        newData.delete(entity.entityId);
        setData(newData);
      },
    });

    return () => semcraft.deleteSystem(system);
  }, [semcraft, ...props]);

  return data;
};
