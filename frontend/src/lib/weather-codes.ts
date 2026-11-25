export function weatherDescription(code: number, isDay = true): string {
  if (code === 0) return isDay ? "Ciel dégagé" : "Nuit dégagée";
  if (code === 1) return "Peu nuageux";
  if (code === 2) return "Partiellement nuageux";
  if (code === 3) return "Ciel couvert";
  if ([45, 48].includes(code)) return "Brouillard";
  if ([51, 53, 55].includes(code)) return "Bruine";
  if ([56, 57, 66, 67].includes(code)) return "Pluie verglaçante";
  if ([61, 63, 65].includes(code)) return "Pluie";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neige";
  if ([80, 81, 82].includes(code)) return "Averses";
  if ([95, 96, 99].includes(code)) return "Orages";
  return "Conditions non précisées";
}
export const temperature = (value: number) => `${Math.round(value)}°`;
