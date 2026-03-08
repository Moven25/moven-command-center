import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./LoadCommand.css";
import { supabase } from "../lib/supabaseClient";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value) {
  const num = Number(value || 0);
  return `$${num.toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  } catch {
    return value;
  }
}

export default function LoadCommand() {
  const [pickupCity, setPickupCity] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [equipment, setEquipment] = useState("Dry Van");
  const [pickupAt, setPickupAt] = useState("");
  const [deliveryAt, setDeliveryAt] = useState("");
  const [miles, setMiles] = useState("");
  const [rate, setRate] = useState("");
  const [status, setStatus] = useState("Booked");
  const [notes, setNotes] = useState("");
  const [carrierId, setCarrierId] = useState("");
  const [ref, setRef] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [broker, setBroker] = useState("");
  const [detentionRisk, setDetentionRisk] = useState(false);

  const [carriers, setCarriers] = useState([]);
  const [carrierLoading, setCarrierLoading] = useState(false);
  const [carrierError, setCarrierError] = useState("");

  const [recentLoads, setRecentLoads] = useState([]);
  const [recentLoadsLoading, setRecentLoadsLoading] = useState(false);
  const [recentLoadsError, setRecentLoadsError] = useState("");

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const selectedCarrier = useMemo(
    () => carriers.find((carrier) => String(carrier.id) === String(carrierId)),
    [carriers, carrierId]
  );

  const preview = useMemo(() => {
    const milesValue = toNumber(miles);
    const rateValue = toNumber(rate);
    if (!milesValue || !rateValue) return null;

    const rpm = rateValue / milesValue;
    const fuelCost = milesValue * 0.61;
    const grossProfit = rateValue - fuelCost;
    const movenFee = rateValue * 0.1;
    const carrierNet = rateValue - movenFee;
    const netRpm = carrierNet / milesValue;

    return {
      rpm,
      fuelCost,
      grossProfit,
      movenFee,
      carrierNet,
      netRpm,
      margin: rateValue ? (grossProfit / rateValue) * 100 : 0,
    };
  }, [miles, rate]);

  const loadRecentLoads = useCallback(async () => {
    setRecentLoadsLoading(true);
    setRecentLoadsError("");

    try {
      const { data, error } = await supabase
        .from("loads")
        .select(
          "id, carrier_id, carrier_name, broker, miles, rate, net_rpm, status, pickup_at, created_at, ref, priority, lane, pickup_city, delivery_city, delivery_at, rpm, notes, detention_risk"
        )
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      setRecentLoads(data || []);
    } catch (err) {
      setRecentLoads([]);
      setRecentLoadsError(err?.message || "Unable to load recent loads.");
    } finally {
      setRecentLoadsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCarriers = async () => {
      setCarrierLoading(true);
      setCarrierError("");

      try {
        const { data, error } = await supabase
          .from("carriers")
          .select("id, name, company_name, status, trucks, rpm_target")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const normalized = (data || [])
          .map((row) => {
            const id = String(row.id || "").trim();
            const label =
              row.name ||
              row.company_name ||
              (id ? `Carrier ${id.slice(0, 8)}` : "Unnamed Carrier");

            return {
              id,
              label,
              status: row.status || "",
              trucks: row.trucks ?? null,
              rpmTarget: row.rpm_target ?? null,
            };
          })
          .filter((row) => row.id);

        if (!isMounted) return;
        setCarriers(normalized);
      } catch (err) {
        if (!isMounted) return;
        setCarriers([]);
        setCarrierError(err?.message || "Unable to load carriers right now.");
      } finally {
        if (isMounted) setCarrierLoading(false);
      }
    };

    loadCarriers();
    loadRecentLoads();

    return () => {
      isMounted = false;
    };
  }, [loadRecentLoads]);

  const loadRecentItemIntoForm = (item) => {
    setCarrierId(item.carrier_id ? String(item.carrier_id) : "");
    setBroker(item.broker || "");
    setMiles(item.miles ? String(item.miles) : "");
    setRate(item.rate ? String(item.rate) : "");
    setStatus(item.status || "Booked");
    setPickupAt(item.pickup_at ? item.pickup_at.slice(0, 16) : "");
    setRef(item.ref || "");
    setPriority(item.priority || "Normal");
    setPickupCity(item.pickup_city || "");
    setDeliveryCity(item.delivery_city || "");
    setDeliveryAt(item.delivery_at ? item.delivery_at.slice(0, 16) : "");
    setNotes(item.notes || "");
    setDetentionRisk(Boolean(item.detention_risk));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    const cleanPickupCity = pickupCity.trim();
    const cleanDeliveryCity = deliveryCity.trim();
    const cleanNotes = notes.trim();
    const cleanBroker = broker.trim();
    const cleanRef = ref.trim();

    const milesValue = toNumber(miles);
    const rateValue = toNumber(rate);

    if (!carrierId) {
      setSaveError("Assigned carrier is required.");
      return;
    }

    if (!cleanPickupCity || !cleanDeliveryCity) {
      setSaveError("Pickup city and delivery city are required.");
      return;
    }

    if (!milesValue || !rateValue) {
      setSaveError("Miles and rate are required.");
      return;
    }

    const rpm = Number((rateValue / milesValue).toFixed(2));
    const carrierNet = Number((rateValue - rateValue * 0.1).toFixed(2));
    const netRpm = Number((carrierNet / milesValue).toFixed(2));
    const lane = `${cleanPickupCity} → ${cleanDeliveryCity}`;

    const payload = {
      carrier_id: carrierId,
      carrier_name: selectedCarrier?.label || null,
      broker: cleanBroker || null,
      miles: milesValue,
      rate: rateValue,
      net_rpm: netRpm,
      status,
      pickup_at: pickupAt || null,
      ref: cleanRef || null,
      priority,
      lane,
      pickup_city: cleanPickupCity,
      delivery_city: cleanDeliveryCity,
      delivery_at: deliveryAt || null,
      rpm,
      notes: cleanNotes || null,
      detention_risk: detentionRisk,
    };

    setSaveLoading(true);

    try {
      const { error } = await supabase.from("loads").insert([payload]);
      if (error) throw error;

      setPickupCity("");
      setDeliveryCity("");
      setEquipment("Dry Van");
      setPickupAt("");
      setDeliveryAt("");
      setMiles("");
      setRate("");
      setStatus("Booked");
      setNotes("");
      setCarrierId("");
      setRef("");
      setPriority("Normal");
      setBroker("");
      setDetentionRisk(false);

      setSaveSuccess("Load saved successfully.");
      await loadRecentLoads();
    } catch (err) {
      setSaveError(err?.message || "Failed to save load command.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="load-command-page">
      <div className="load-command-header card-panel">
        <div>
          <h1>LaneSync Load Command</h1>
          <p>Book, score, and snapshot each load with carrier-level visibility.</p>
        </div>
        <div className="header-chip">/load-command</div>
      </div>

      <div className="load-command-layout">
        <section className="card-panel load-intake-panel">
          <h2>Load Intake</h2>

          <form className="load-form-grid" onSubmit={handleSubmit}>
            <div className="form-section form-section-highlight full-width">
              <div className="section-header">
                <h3>Carrier Assignment</h3>
                <span>Required for lane ownership</span>
              </div>

              <div className="field-group full-width carrier-field">
                <label>Assigned Carrier</label>
                <select
                  value={carrierId}
                  onChange={(e) => setCarrierId(e.target.value)}
                  disabled={carrierLoading || saveLoading || carriers.length === 0}
                  required
                >
                  <option value="">
                    {carrierLoading
                      ? "Loading carriers..."
                      : carriers.length === 0
                        ? "No carriers found. Add a carrier first."
                        : "Select carrier (required)"}
                  </option>
                  {carriers.map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.label}
                    </option>
                  ))}
                </select>
                {carrierError && <p className="field-warning">{carrierError}</p>}
              </div>
            </div>

            <div className="form-section full-width">
              <div className="section-header">
                <h3>Lane Details</h3>
                <span>Route, equipment, and timing</span>
              </div>

              <div className="section-grid">
                <div className="field-group">
                  <label>Pickup City</label>
                  <input
                    type="text"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    placeholder="Chicago, IL"
                    required
                    disabled={saveLoading}
                  />
                </div>

                <div className="field-group">
                  <label>Delivery City</label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="Dallas, TX"
                    required
                    disabled={saveLoading}
                  />
                </div>

                <div className="field-group">
                  <label>Pickup Date / Time</label>
                  <input
                    type="datetime-local"
                    value={pickupAt}
                    onChange={(e) => setPickupAt(e.target.value)}
                    disabled={saveLoading}
                  />
                </div>

                <div className="field-group">
                  <label>Delivery Date / Time</label>
                  <input
                    type="datetime-local"
                    value={deliveryAt}
                    onChange={(e) => setDeliveryAt(e.target.value)}
                    disabled={saveLoading}
                  />
                </div>

                <div className="field-group">
                  <label>Equipment</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    disabled={saveLoading}
                  >
                    <option>Dry Van</option>
                    <option>Reefer</option>
                    <option>Flatbed</option>
                    <option>Power Only</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Broker</label>
                  <input
                    type="text"
                    value={broker}
                    onChange={(e) => setBroker(e.target.value)}
                    placeholder="Broker / company"
                    disabled={saveLoading}
                  />
                </div>

                <div className="field-group">
                  <label>Reference #</label>
                  <input
                    type="text"
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    placeholder="Load ref / PO"
                    disabled={saveLoading}
                  />
                </div>

                <div className="field-group">
                  <label>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={saveLoading}
                  >
                    <option>Normal</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section full-width">
              <div className="section-header">
                <h3>Economics + Decision</h3>
                <span>Rate, miles, status and notes</span>
              </div>

              <div className="section-grid">
                <div className="field-group">
                  <label>Miles</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={miles}
                    onChange={(e) => setMiles(e.target.value)}
                    placeholder="925"
                    required
                    disabled={saveLoading}
                  />
                </div>

                <div className="field-group">
                  <label>Rate ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="2850"
                    required
                    disabled={saveLoading}
                  />
                </div>

                <div className="field-group">
                  <label>Auto RPM</label>
                  <input
                    type="text"
                    value={preview ? preview.rpm.toFixed(2) : ""}
                    placeholder="Calculated automatically"
                    readOnly
                  />
                </div>

                <div className="field-group">
                  <label>Auto Net RPM</label>
                  <input
                    type="text"
                    value={preview ? preview.netRpm.toFixed(2) : ""}
                    placeholder="Calculated automatically"
                    readOnly
                  />
                </div>

                <div className="field-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={saveLoading}
                  >
                    <option>Booked</option>
                    <option>En Route</option>
                    <option>At Pickup</option>
                    <option>At Delivery</option>
                    <option>Completed</option>
                    <option>Issue</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Estimated Carrier Net</label>
                  <input
                    type="text"
                    value={preview ? formatMoney(preview.carrierNet) : ""}
                    placeholder="Calculated automatically"
                    readOnly
                  />
                </div>

                <div className="field-group full-width">
                  <label>Decision</label>
                  <div className="decision-row">
                    <button
                      type="button"
                      className={status !== "Issue" ? "decision-btn active" : "decision-btn"}
                      onClick={() => setStatus("Booked")}
                      disabled={saveLoading}
                    >
                      <span className="btn-dot" />
                      Accept
                    </button>

                    <button
                      type="button"
                      className={status === "Issue" ? "decision-btn reject active" : "decision-btn reject"}
                      onClick={() => setStatus("Issue")}
                      disabled={saveLoading}
                    >
                      <span className="btn-dot" />
                      Reject
                    </button>
                  </div>
                </div>

                <div className="field-group full-width checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={detentionRisk}
                      onChange={(e) => setDetentionRisk(e.target.checked)}
                      disabled={saveLoading}
                    />
                    <span>Flag as detention risk</span>
                  </label>
                </div>

                <div className="field-group full-width">
                  <label>Dispatch Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions, margin concerns, broker behavior, etc."
                    rows={4}
                    disabled={saveLoading}
                  />
                </div>
              </div>
            </div>

            {saveError && (
              <div className="field-group full-width">
                <p className="field-warning">{saveError}</p>
              </div>
            )}

            {saveSuccess && (
              <div className="field-group full-width">
                <p className="field-success">{saveSuccess}</p>
              </div>
            )}

            <button className="add-load-btn" type="submit" disabled={saveLoading}>
              <span className="save-icon">✦</span>
              {saveLoading ? "Saving..." : "Save Load Command"}
            </button>
          </form>
        </section>

        <aside className="load-side-column">
          <section className="card-panel side-card">
            <div className="panel-head">
              <h3>Lane Snapshot</h3>
              <span className="panel-tag">Live Metrics</span>
            </div>

            {!preview ? (
              <p className="empty-hint">Enter miles and rate to calculate lane metrics.</p>
            ) : (
              <div className="metrics-grid">
                <div className="metric">
                  <span>RPM</span>
                  <strong>{formatMoney(preview.rpm)}</strong>
                </div>
                <div className="metric">
                  <span>Net RPM</span>
                  <strong>{formatMoney(preview.netRpm)}</strong>
                </div>
                <div className="metric">
                  <span>Gross Profit</span>
                  <strong>{formatMoney(preview.grossProfit)}</strong>
                </div>
                <div className="metric">
                  <span>Fuel Cost (est.)</span>
                  <strong>{formatMoney(preview.fuelCost)}</strong>
                </div>
                <div className="metric">
                  <span>Margin</span>
                  <strong>{preview.margin.toFixed(1)}%</strong>
                </div>
                <div className="metric">
                  <span>Carrier Net</span>
                  <strong>{formatMoney(preview.carrierNet)}</strong>
                </div>
              </div>
            )}
          </section>

          <section className="card-panel side-card">
            <div className="panel-head">
              <h3>Intelligence</h3>
              <span className="panel-tag">Dispatch Assist</span>
            </div>

            <div className="intelligence-list">
              <div className="intel-item">
                <span>Assigned Carrier</span>
                <strong>{selectedCarrier ? selectedCarrier.label : "Not selected"}</strong>
              </div>

              <div className="intel-item">
                <span>Status</span>
                <strong>{status}</strong>
              </div>

              <div className="intel-item">
                <span>Operational Snapshot</span>
                <strong>
                  {pickupCity || "Pickup"} → {deliveryCity || "Delivery"}
                </strong>
              </div>

              <div className="intel-item">
                <span>Reference</span>
                <strong>{ref || "Not set"}</strong>
              </div>

              <div className="intel-item">
                <span>Priority</span>
                <strong>{priority}</strong>
              </div>
            </div>
          </section>

          <section className="card-panel side-card">
            <div className="panel-head">
              <h3>Recent Loads</h3>
              <span className="panel-tag">Last 8</span>
            </div>

            <div className="recent-loads">
              {recentLoadsLoading ? (
                <p className="empty-hint">Loading recent loads...</p>
              ) : recentLoadsError ? (
                <p className="field-warning">{recentLoadsError}</p>
              ) : recentLoads.length === 0 ? (
                <p className="empty-hint">No loads logged yet.</p>
              ) : (
                recentLoads.map((item, i) => (
                  <button
                    type="button"
                    key={`${item.id || item.created_at || "load"}-${i}`}
                    className="recent-load-item"
                    onClick={() => loadRecentItemIntoForm(item)}
                  >
                    <p>
                      <strong>{item.pickup_city || "Pickup"}</strong> →{" "}
                      <strong>{item.delivery_city || "Delivery"}</strong>
                    </p>
                    <p>
                      {item.miles ?? "-"} mi · ${item.rate ?? "-"} · RPM {item.rpm ?? "-"}
                    </p>
                    <p>
                      Carrier: {item.carrier_name || item.carrier_id || "Unassigned"} ·{" "}
                      {item.status || "PENDING"}
                    </p>
                    <p className="recent-load-meta">
                      {item.ref || "No Ref"} · {formatDateTime(item.created_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}