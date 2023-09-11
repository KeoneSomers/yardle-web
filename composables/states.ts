export const useSelectedYardId = () =>
  useState<number>("SelectedYardId", () => 0);

export const useColor = () => useState<string>("color", () => "pink");
