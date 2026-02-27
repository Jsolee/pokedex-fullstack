export function formatPokemonId(id: number) {
  return `#${id.toString().padStart(4, "0")}`;
}

export function formatStatName(statName: string) {
  switch (statName) {
    case "hp":
      return "HP";
    case "attack":
      return "ATK";
    case "defense":
      return "DEF";
    case "special-attack":
      return "SP. ATK";
    case "special-defense":
      return "SP. DEF";
    case "speed":
      return "SPD";
    default:
      return statName.toUpperCase();
  }
}

export function toKilograms(hectograms: number) {
  return (hectograms / 10).toFixed(1);
}

export function toMeters(decimeters: number) {
  return (decimeters / 10).toFixed(1);
}
