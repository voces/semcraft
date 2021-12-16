export type Entity = {
  /////////////////////////////////////////////////////////////////////////////
  // Hierarchy
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Add a child to the system.
   */
  add: (entity: Entity) => void;

  /**
   * Children of the system.
   */
  children: ReadonlyArray<Entity>;

  /**
   * A map of entity keys to systems.
   */
  childPropMap: Readonly<Partial<Record<keyof Entity, ReadonlyArray<Entity>>>>;

  /////////////////////////////////////////////////////////////////////////////
  // Basic entities
  /////////////////////////////////////////////////////////////////////////////

  /**
   * x position of the entity.
   */
  x?: number;

  /**
   * y position of the entity.
   */
  y?: number;

  /**
   * Parent of the entity.
   */
  parent?: Entity;

  /////////////////////////////////////////////////////////////////////////////
  // Systems
  /////////////////////////////////////////////////////////////////////////////

  /**
   * The systems of the app. Automatically appended to when adding an entity
   * with system properties.
   */
  systems?: ReadonlyArray<Entity>;

  /**
   * Properties of entities the system is interested in. An empty array means
   * no entities are added and the entity will act as a mechanism.
   */
  props?: readonly (keyof Entity)[];

  /**
   * Test whether an entity should be in the system. Invoked each time an
   * entity in `parent.children` sees a property in `props` set.
   */
  test?: (entity: Entity) => boolean;

  /**
   * Invoked when an entity is added to the system.
   */
  onAdd?: (entity: Entity) => void;

  /**
   * Invoked when an entity is removed from the system.
   */
  onRemove?: (entity: Entity) => void;

  /**
   * Invoked each time `test`
   */
  onChange?: (entity: Entity) => void;

  /**
   * Invoked each logical clock update.
   */
  update?: (delta: number, time: number) => void;

  /**
   * Invoked each logical clock update for each child of the system.
   */
  updateChild?: (child: Entity, delta: number, time: number) => void;

  /**
   * Invoked each render.
   */
  render?: (delta: number, time: number) => void;

  /**
   * Invoked each render for each child of the system.
   */
  renderChild?: (child: Entity, delta: number, time: number) => void;
};

export const newEntity = (
  entity?: Partial<Entity>,
) => {
  const mutableEntity = entity as ({
    children?: Entity[];
    childPropMap?: Partial<Record<keyof Entity, Entity[]>>;
    add?: (entity: Entity) => void;
    systems?: Entity[];
  });

  if (!mutableEntity.children) mutableEntity.children = [];

  if (!mutableEntity.childPropMap) mutableEntity.childPropMap = {};

  if (!mutableEntity.add) {
    mutableEntity.add = (child: Entity) => {
      // Register system optimization map
      if (child.props) {
        for (const prop of child.props) {
          if (!mutableEntity.childPropMap?.[prop]) {
            mutableEntity.childPropMap![prop] = [];
          }
          mutableEntity.childPropMap?.[prop]?.push(child);
        }

        if (!mutableEntity.systems) mutableEntity.systems = [];
        mutableEntity.systems.push(child);
      }

      mutableEntity.children?.push(child);
    };
  }

  return new Proxy(mutableEntity as Entity, {
    set: (target, property, value) => {
      target[property as keyof Entity] = value;
      return true;
    },
  });
};

const animateBalls = newEntity({
  props: ["x", "y"] as const,
  test: (entity): entity is Entity & { x: number; y: number } =>
    typeof entity === "object" && !!entity && "x" in entity && "y" in entity,
  updateChild: (ball: Entity) => {
    ball.x!++;
    ball.y!++;
  },
});

const root = newEntity();
root.add(animateBalls);

export const newApp = (entity: Entity) => {
  let lastUpdate = Date.now();
  entity.update = () => {
    const next = Date.now();
    const delta = next - lastUpdate;
    lastUpdate = next;

    if (entity.systems) {
      for (const system of entity.systems) {
        system.update?.(delta, next);

        for (const child of entity.children) {
          system.updateChild?.(child, delta, next);
        }
      }
    }
  };

  let lastRender = Date.now();
  entity.render = () => {
    const next = Date.now();
    const delta = next - lastRender;
    lastRender = next;

    if (entity.systems) {
      for (const system of entity.systems) {
        system.render?.(delta, next);

        for (const child of entity.children) {
          system.renderChild?.(child, delta, next);
        }
      }
    }
  };
};
