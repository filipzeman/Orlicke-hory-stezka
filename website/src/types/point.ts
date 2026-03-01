export interface Service {
  type: "sleeping" | "food";
  name?: string;
  phone?: string;
  website?: string;
  note?: string;
}

export interface Point {
  slug: string;
  name: string;
  km: number;
  elevation: number;
  type: string;
  sleeping: Service[];
  food: Service[];
  water: boolean;
  shortDescription: string;
}
