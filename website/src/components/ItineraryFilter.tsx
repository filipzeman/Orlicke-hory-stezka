import { useState } from "react";
import PointCard from "./PointCard.astro";
import type { Point } from "../types/point";

export default function ItineraryFilter({ points }) {
  const [filter, setFilter] = useState("all");

  const filtered = points.filter((point: Point) => {
    if (filter === "sleeping") return point.sleeping.length > 0;
    if (filter === "food") return point.food.length > 0;
    if (filter === "water") return point.water;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setFilter("all")}>Vše</button>
        <button onClick={() => setFilter("sleeping")}>Ubytování</button>
        <button onClick={() => setFilter("food")}>Jídlo</button>
        <button onClick={() => setFilter("water")}>Voda</button>
      </div>

      {filtered.map((point: Point) => (
        <PointCard point={point} key={point.slug} />
      ))}
    </div>
  );
}