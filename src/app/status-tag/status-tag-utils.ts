import { StatusTagColor } from './status-tag-color';

export function getDeploymentEnvironmentColors(environmentNames: string[]) {
  const set = new Set(environmentNames.toSorted());
  const colors = [
    StatusTagColor.GREEN,
    StatusTagColor.BLUE,
    StatusTagColor.YELLOW,
    StatusTagColor.RED,
    StatusTagColor.GRAY,
  ];

  return [...set].reduce(
    (cum, environment, index) => ({
      ...cum,
      [environment]: colors[index % colors.length],
    }),
    {} as { [environment: string]: StatusTagColor },
  );
}
