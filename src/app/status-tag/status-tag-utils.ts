import { StatusTagColor } from './status-tag-color';

export function getDeploymentEnvironmentColors(environmentNames: string[]) {
  const set = new Set(environmentNames);
  const colors = [
    StatusTagColor.GREEN,
    StatusTagColor.YELLOW,
    StatusTagColor.BLUE,
    StatusTagColor.RED,
    StatusTagColor.GRAY,
  ];

  return [...set].reduce(
    (cum, environment, index) => ({
      ...cum,
      [environment]: colors[index % colors.length],
    }),
    {} as { [environment: string]: StatusTagColor }
  );
}
