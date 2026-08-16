import { useEffect, useMemo, useState } from "react";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";

import ImageGalleryField from "../components/media/ImageGalleryField";

// 'import PointPickerModal from "../components/points/PointPickerModal";'
import { categoryLookup } from "../config/categoryLookup";
import { pointMetadata } from "../../config/pointMetadata";

import { getCategoryKey } from "../../utils/pointMetadata";

import { getPoints, getPointDetails, savePointDetails } from "../services/pointDetailsService";
import { updatePoint } from "../services/pointService";
import { categoryTypes } from "../config/categoryTypes";

import type { Point } from "../../types/point";

import type { PointDetails } from "../../types/pointDetails";

import type { UploadedImage } from "../services/mediaService";
import { toUploadedImage } from "../services/mediaService";

import { normalizeText } from "../../utils/text";

type PointDetailsEditor = Omit<PointDetails, "images"> & {
  images: UploadedImage[];
};

export default function PointsSection() {
  const [points, setPoints] = useState<Point[]>([]);

  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  const [details, setDetails] = useState<PointDetailsEditor | null>(null);

  const [editedPoint, setEditedPoint] = useState<Point | null>(null);

  const [search, setSearch] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const categoryKey = editedPoint?.category;

  useEffect(() => {
    async function load() {
      try {
        const data = await getPoints();

        const normalized = data.map((point) => ({
          ...point,
          category: getCategoryKey(point.category) as Point["category"],
          type: point.type,
        }));

        setPoints(normalized);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!selectedPoint) return;

    const pointId = selectedPoint.id;

    async function loadDetails() {
      try {
        const data = await getPointDetails(pointId);

        setDetails({
          point_id: pointId,

          phone: data?.phone || "",

          email: data?.email || "",

          website: data?.website || "",

          opening_info: data?.opening_info || "",

          note: data?.note || "",

          hikers_welcome: data?.hikers_welcome || false,

          active: data?.active ?? true,

          images: data?.images?.map(toUploadedImage) || [],
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadDetails();
  }, [selectedPoint]);

  const filteredPoints = useMemo(() => {
    return points.filter((point) =>
      normalizeText(point.point_name).includes(normalizeText(search))
    );
  }, [points, search]);

  const categories = Object.keys(pointMetadata.categories);

  const availableTypes = categoryKey ? categoryTypes[categoryKey] : [];
  // console.log("category types", categoryTypes);

  function updateEditedPoint<K extends keyof Point>(key: K, value: Point[K]) {
    setEditedPoint((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [key]: value,
      };
    });
  }

  function updateCategory(category: Point["category"]) {
    const firstType = categoryTypes[category]?.[0];

    setEditedPoint((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        category,
        type: firstType ?? prev.type,
      };
    });
  }

  async function handleSave() {
    if (!details || !editedPoint) return;

    try {
      setSaving(true);
      setSaved(false);

      await updatePoint(editedPoint);
      await savePointDetails({
        ...details,
        images: details.images.map((image) => image.path),
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // console.log("editedPoint.category =", editedPoint?.category);
  return (
    <div className="points-content">
      {/* SELECTOR */}

      <div className="points-selector">
        <Card title="Body na trase">
          <div className="points-sidebar">
            <Input
              placeholder="Zadejte nebo vyberte z nabídky..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="points-list">
              {filteredPoints.map((point) => (
                <button
                  key={point.id}
                  className={`point-item ${selectedPoint?.id === point.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedPoint(point);

                    setEditedPoint({
                      ...point,
                    });
                  }}
                >
                  <span>{point.point_name}</span>

                  <small>{point.km} km</small>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* EDITOR */}

      <div className="points-editor">
        {selectedPoint && details ? (
          <Card title={selectedPoint.point_name}>
            <div className="settings-form">
              <h3 className="settings-subtitle">Základní údaje</h3>
              <div className="settings-actions">
                <Button disabled={saving} onClick={handleSave}>
                  {saving ? "Ukládám..." : saved ? "Uloženo" : "Uložit"}
                </Button>
              </div>

              <Input
                label="Název"
                value={editedPoint?.point_name ?? ""}
                onChange={(e) => updateEditedPoint("point_name", e.target.value)}
              />

              <div className="input-group">
                <label className="input-label">Kategorie</label>

                <select
                  className="select"
                  value={editedPoint?.category ?? ""}
                  onChange={(e) => updateCategory(e.target.value as Point["category"])}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {
                        pointMetadata.categories[category as keyof typeof pointMetadata.categories]
                          .label
                      }
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Typ</label>

                <select
                  className="select"
                  value={editedPoint?.type ?? ""}
                  onChange={(e) => updateEditedPoint("type", e.target.value as Point["type"])}
                >
                  {availableTypes.map((type) => {
                    // console.log("available type", type);

                    return (
                      <option key={type} value={type}>
                        {pointMetadata.types[type as keyof typeof pointMetadata.types]?.label ??
                          type}
                      </option>
                    );
                  })}
                </select>
              </div>

              <Input
                label="Kilometr"
                value={editedPoint?.km ?? ""}
                type="number"
                onChange={(e) => updateEditedPoint("km", Number(e.target.value))}
              />

              <Input
                label="Nadmořská výška"
                type="number"
                value={editedPoint?.elevation ?? ""}
                onChange={(e) =>
                  updateEditedPoint("elevation", e.target.value ? Number(e.target.value) : null)
                }
              />

              <Input
                label="Latitude"
                type="number"
                value={editedPoint?.latitude ?? ""}
                onChange={(e) => updateEditedPoint("latitude", Number(e.target.value))}
              />

              <Input
                label="Longitude"
                type="number"
                value={editedPoint?.longitude ?? ""}
                onChange={(e) => updateEditedPoint("longitude", Number(e.target.value))}
              />

              <Input
                label="Location ID"
                value={editedPoint?.location_id ?? ""}
                onChange={(e) => updateEditedPoint("location_id", e.target.value)}
              />

              <Input
                label="Location Name"
                value={editedPoint?.location_name ?? ""}
                onChange={(e) => updateEditedPoint("location_name", e.target.value)}
              />

              <Input
                label="Kilometr"
                value={editedPoint?.km ?? ""}
                type="number"
                onChange={(e) => updateEditedPoint("km", Number(e.target.value))}
              />

              <Input
                label="Nadmořská výška"
                value={editedPoint?.elevation ?? ""}
                type="number"
                onChange={(e) => updateEditedPoint("elevation", Number(e.target.value))}
              />

              <div className="input-group">
                <label className="input-label">Barva značení</label>

                <select
                  className="select"
                  value={editedPoint?.navigation_color ?? "-"}
                  onChange={(e) => updateEditedPoint("navigation_color", e.target.value)}
                >
                  <option value="-">-</option>

                  <option value="cervena">Červená</option>

                  <option value="modra">Modrá</option>

                  <option value="zelena">Zelená</option>

                  <option value="zluta">Žlutá</option>
                </select>
              </div>

              <Input
                label="Číslo rozcestníku"
                value={editedPoint?.crossroad_number ?? ""}
                onChange={(e) => updateEditedPoint("crossroad_number", e.target.value)}
              />

              <Input
                label="Latitude"
                value={editedPoint?.latitude ?? ""}
                type="number"
                onChange={(e) => updateEditedPoint("latitude", Number(e.target.value))}
              />

              <Input
                label="Longitude"
                value={editedPoint?.longitude ?? ""}
                type="number"
                onChange={(e) => updateEditedPoint("longitude", Number(e.target.value))}
              />

              <h3 className="settings-subtitle">Rozšířené údaje</h3>
              <Input
                label="Telefon"
                value={details.phone || ""}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    phone: e.target.value,
                  })
                }
              />

              <Input
                label="Email"
                value={details.email || ""}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    email: e.target.value,
                  })
                }
              />

              <Input
                label="Web"
                value={details.website || ""}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    website: e.target.value,
                  })
                }
              />

              <div className="input-group">
                <label className="input-label">Otevírací doba</label>

                <textarea
                  className="textarea"
                  value={details.opening_info || ""}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      opening_info: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label">Poznámka</label>

                <textarea
                  className="textarea"
                  value={details.note || ""}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      note: e.target.value,
                    })
                  }
                />
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={details.active}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      active: e.target.checked,
                    })
                  }
                />
                Aktivní
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={details.hikers_welcome || false}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      hikers_welcome: e.target.checked,
                    })
                  }
                />
                Hikers welcome
              </label>

              <ImageGalleryField
                folder={`points/${selectedPoint.id}`}
                value={details.images}
                onChange={(images) =>
                  setDetails({
                    ...details,
                    images,
                  })
                }
              />

              <div className="settings-actions">
                <Button disabled={saving} onClick={handleSave}>
                  {saving ? "Ukládám..." : saved ? "Uloženo" : "Uložit"}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card title="Správa bodů">
            <div className="empty-state">
              <p className="no-vertical-spacing">
                Vyberte bod ze seznamu vlevo nebo jej vyhledejte.
              </p>
              <ul>
                <li>Kontakty</li>
                <li>Otevírací doba</li>
                <li>Poznámky</li>
                <li>Fotografie</li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
