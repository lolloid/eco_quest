export function getTiledProp(object, name, fallback = null) {
  const prop = object?.properties?.find((item) => item.name === name);
  return prop?.value ?? fallback;
}

export function makeClientEventId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
