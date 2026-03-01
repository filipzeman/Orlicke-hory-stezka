export interface Service {
  type: string;
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
