// src/state/DataContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

/* -----------------------------
   LocalStorage Keys
------------------------------ */
const LS_TRAINING = "lanesync_training_mode_v1";

/* -----------------------------
   LIVE Seeds (your current spine)
------------------------------ */
const SEED_CARRIERS = [
  {
    id: "CR-10024",
    name: "Hawk Transport LLC",
    status: "Active",
    riskScore: 18,
    mc: "MC-742198",
    dot: "DOT-312490",
    phone: "(312) 555-0148",
    email: "dispatch@hawktransport.com",
    homeBase: "Chicago, IL",
    equipment: "Dry Van (53')",
    insuranceOnFile: true,
    insuranceExp: "2026-03-18",
    w9OnFile: true,
    authorityOnFile: true,
    onTime: 94,
    claims: 0,
    lastContactAt: "2026-01-10T14:20:00Z",
    notes: "Strong Midwest carrier. Prefers morning pickups.",

    compliancePerformanceNotes:
      "A-rated paperwork. Always sends POD quickly. No recent compliance issues.",
    complianceNotes:
      "Insurance + W9 verified. Authority active. Monitor renewal dates quarterly.",
    performanceNotes:
      "On-time strong. Great communication. Good candidate for repeat lanes.",
  },
  {
    id: "CR-10031",
    name: "Evergreen Carriers",
    status: "At Risk",
    riskScore: 61,
    mc: "MC-585872",
    dot: "DOT-250991",
    phone: "(404) 555-0172",
    email: "ops@evergreencarriers.com",
    homeBase: "Atlanta, GA",
    equipment: "Reefer (53')",
    insuranceOnFile: true,
    insuranceExp: "2026-01-29",
    w9OnFile: true,
    authorityOnFile: true,
    onTime: 82,
    claims: 3,
    lastContactAt: "2026-01-10T00:10:00Z",
    notes: "Late deliveries last quarter. Watch detention.",

    compliancePerformanceNotes:
      "Paperwork sometimes late. POD turnaround inconsistent. Track follow-ups.",
    complianceNotes:
      "Insurance expires soon—request updated COI 10 days before expiration.",
    performanceNotes:
      "Higher detention risk. Needs tighter check calls + stronger appointment control.",
  },
  {
    id: "CR-10040",
    name: "Vanguard Trucking",
    status: "Onboarding",
    riskScore: 35,
    mc: "MC-931046",
    dot: "DOT-288174",
    phone: "(901) 555-0199",
    email: "carrier@vanguardtrk.com",
    homeBase: "Memphis, TN",
    equipment: "Flatbed",
    insuranceOnFile: false,
    insuranceExp: "",
    w9OnFile: true,
    authorityOnFile: false,
    onTime: 0,
    claims: 0,
    lastContactAt: "2026-01-09T16:40:00Z",
    notes: "Waiting on insurance + authority verification.",

    compliancePerformanceNotes:
      "Onboarding—no historical performance. Require full doc pack before dispatch.",
    complianceNotes:
      "Missing insurance + authority verification. Do not book until completed.",
    performanceNotes:
      "Training carrier until verified. Use short lanes + strict check call schedule.",
  },
];

function daysFromNowISO(days, hours = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

const SEED_LOADS = [
  {
    id: "LD-10241",
    status: "En Route",
    priority: "Normal",
    broker: "BlueRock Logistics",
    carrierId: "CR-10024",
    carrier: "Hawk Transport LLC",
    lane: "Chicago, IL → Dallas, TX",
    pickupCity: "Chicago, IL",
    pickupAt: daysFromNowISO(0, 8),
    deliveryCity: "Dallas, TX",
    deliveryAt: daysFromNowISO(1, 14),
    netRpm: 2.18,
    miles: 925,
    detentionRisk: false,
    notes: "Driver prefers text. Confirm lumper receipt.",
    lastCheckCallAt: null,
  },
  {
    id: "LD-10255",
    status: "At Pickup",
    priority: "High",
    broker: "Summit Freight",
    carrierId: "CR-10031",
    carrier: "Evergreen Carriers",
    lane: "Atlanta, GA → Orlando, FL",
    pickupCity: "Atlanta, GA",
    pickupAt: daysFromNowISO(0, 10),
    deliveryCity: "Orlando, FL",
    deliveryAt: daysFromNowISO(0, 18),
    netRpm: 1.84,
    miles: 438,
    detentionRisk: true,
    notes: "Appointment 10:30. Free time 2 hrs.",
    lastCheckCallAt: null,
  },
  {
    id: "LD-10261",
    status: "Booked",
    priority: "Normal",
    broker: "Northstar Brokerage",
    carrierId: "CR-10040",
    carrier: "Vanguard Trucking",
    lane: "Memphis, TN → Houston, TX",
    pickupCity: "Memphis, TN",
    pickupAt: daysFromNowISO(1, 9),
    deliveryCity: "Houston, TX",
    deliveryAt: daysFromNowISO(2, 13),
    netRpm: 2.33,
    miles: 564,
    detentionRisk: false,
    notes: "Rate con pending. Verify commodity + temp.",
    lastCheckCallAt: null,
  },
  {
    id: "LD-10266",
    status: "At Delivery",
    priority: "Normal",
    broker: "Atlas Freight Co.",
    carrierId: "CR-10024",
    carrier: "Hawk Transport LLC",
    lane: "Newark, NJ → Boston, MA",
    pickupCity: "Newark, NJ",
    pickupAt: daysFromNowISO(0, 6),
    deliveryCity: "Boston, MA",
    deliveryAt: daysFromNowISO(0, 15),
    netRpm: 2.71,
    miles: 316,
    detentionRisk: false,
    notes: "Receiver tight dock. Need POD immediately.",
    lastCheckCallAt: null,
  },
  {
    id: "LD-10270",
    status: "Issue",
    priority: "High",
    broker: "Canyon Logistics",
    carrierId: "CR-10031",
    carrier: "Evergreen Carriers",
    lane: "Phoenix, AZ → Las Vegas, NV",
    pickupCity: "Phoenix, AZ",
    pickupAt: daysFromNowISO(0, 7),
    deliveryCity: "Las Vegas, NV",
    deliveryAt: daysFromNowISO(0, 16),
    netRpm: 1.61,
    miles: 302,
    detentionRisk: true,
    notes: "Delay: shipper dock backed up. Broker notified.",
    lastCheckCallAt: null,
  },
];

/* -----------------------------
   LIVE BROKER Seeds (new)
------------------------------ */
const SEED_BROKERS = [
  {
    id: "BR-11001",
    name: "BlueRock Logistics",
    email: "ops@bluerocklogistics.com",
    phone: "(212) 555-0110",
    city: "New York, NY",
    riskScore: 28,
    creditScore: 82,
    hot: true,
    lastContactAt: "2026-01-10T15:05:00Z",
    notes: "Pays okay. Responds fast when updated early. Ask for detention upfront.",
    lanePrefs: "Midwest → TX, Northeast → New England. Avoid NYC dock tight.",
  },
  {
    id: "BR-11002",
    name: "Summit Freight",
    email: "team@summitfreight.com",
    phone: "(615) 555-0122",
    city: "Nashville, TN",
    riskScore: 42,
    creditScore: 68,
    hot: false,
    lastContactAt: "2026-01-09T19:40:00Z",
    notes: "Hard negotiator. Likes quick ETAs. Push for TONU on cancels.",
    lanePrefs: "Southeast regional, ATL/ORL. Prefers same-day turn loads.",
  },
  {
    id: "BR-11003",
    name: "Northstar Brokerage",
    email: "dispatch@northstarbrokerage.com",
    phone: "(312) 555-0188",
    city: "Chicago, IL",
    riskScore: 18,
    creditScore: 88,
    hot: true,
    lastContactAt: "2026-01-10T13:25:00Z",
    notes: "Solid credit. Repeat lanes available. Keep performance clean.",
    lanePrefs: "CHI → HOU, CHI → DAL, MEM → HOU.",
  },
  {
    id: "BR-11004",
    name: "Canyon Logistics",
    email: "ops@canyonlogistics.com",
    phone: "(602) 555-0169",
    city: "Phoenix, AZ",
    riskScore: 62,
    creditScore: 54,
    hot: false,
    lastContactAt: "2026-01-10T02:12:00Z",
    notes: "Risky: slow pay claims reported. Get rate con + accessorials in writing.",
    lanePrefs: "AZ → NV / CA short hauls. Confirm appt windows.",
  },
];

/* -----------------------------
   TRAINING Seeds (safe demo data)
------------------------------ */
const TRAINING_CARRIERS = [
  {
    id: "TR-20001",
    name: "Training Carrier Alpha",
    status: "Active",
    riskScore: 22,
    mc: "MC-TRAIN-001",
    dot: "DOT-TRAIN-001",
    phone: "(555) 010-2001",
    email: "alpha@training.lanesync",
    homeBase: "Chicago, IL",
    equipment: "Dry Van (53')",
    insuranceOnFile: true,
    insuranceExp: "2026-06-01",
    w9OnFile: true,
    authorityOnFile: true,
    onTime: 92,
    claims: 0,
    lastContactAt: daysFromNowISO(0, 9),
    notes: "Demo carrier. Use for booking + status practice.",

    compliancePerformanceNotes:
      "Training: upload W9/COI, practice documenting POD + invoicing.",
    complianceNotes:
      "Training: treat as verified. Practice: set reminders + check call cadence.",
    performanceNotes:
      "Training: practice on-time updates + customer comms.",
  },
  {
    id: "TR-20002",
    name: "Training Carrier Bravo",
    status: "At Risk",
    riskScore: 64,
    mc: "MC-TRAIN-002",
    dot: "DOT-TRAIN-002",
    phone: "(555) 010-2002",
    email: "bravo@training.lanesync",
    homeBase: "Atlanta, GA",
    equipment: "Reefer (53')",
    insuranceOnFile: true,
    insuranceExp: "2026-01-20",
    w9OnFile: true,
    authorityOnFile: true,
    onTime: 78,
    claims: 2,
    lastContactAt: daysFromNowISO(-1, 16),
    notes: "Demo risk carrier. Use for detention + issue handling.",

    compliancePerformanceNotes:
      "Training: document problems, send updates to broker, request POD fast.",
    complianceNotes:
      "Training: set COI renewal reminder and verify reefer requirements.",
    performanceNotes:
      "Training: check calls every 2–3 hours when at-risk.",
  },
  {
    id: "TR-20003",
    name: "Training Carrier Charlie",
    status: "Onboarding",
    riskScore: 35,
    mc: "MC-TRAIN-003",
    dot: "DOT-TRAIN-003",
    phone: "(555) 010-2003",
    email: "charlie@training.lanesync",
    homeBase: "Memphis, TN",
    equipment: "Flatbed",
    insuranceOnFile: false,
    insuranceExp: "",
    w9OnFile: true,
    authorityOnFile: false,
    onTime: 0,
    claims: 0,
    lastContactAt: daysFromNowISO(-2, 11),
    notes: "Demo onboarding carrier. Practice missing docs workflow.",

    compliancePerformanceNotes:
      "Training: onboarding stage — missing insurance/authority.",
    complianceNotes:
      "Training: request COI + authority proof, do not dispatch until verified.",
    performanceNotes:
      "Training: once verified, start with short safe lanes.",
  },
];

const TRAINING_LOADS = [
  {
    id: "TL-30001",
    status: "Booked",
    priority: "Normal",
    broker: "Training Broker One",
    carrierId: "TR-20001",
    carrier: "Training Carrier Alpha",
    lane: "Chicago, IL → Dallas, TX",
    pickupCity: "Chicago, IL",
    pickupAt: daysFromNowISO(0, 8),
    deliveryCity: "Dallas, TX",
    deliveryAt: daysFromNowISO(1, 14),
    netRpm: 2.21,
    miles: 925,
    detentionRisk: false,
    notes: "Practice: assign carrier + confirm appointment.",
    lastCheckCallAt: null,
  },
  {
    id: "TL-30002",
    status: "At Pickup",
    priority: "High",
    broker: "Training Broker Two",
    carrierId: "TR-20002",
    carrier: "Training Carrier Bravo",
    lane: "Atlanta, GA → Orlando, FL",
    pickupCity: "Atlanta, GA",
    pickupAt: daysFromNowISO(0, 10),
    deliveryCity: "Orlando, FL",
    deliveryAt: daysFromNowISO(0, 18),
    netRpm: 1.79,
    miles: 438,
    detentionRisk: true,
    notes: "Practice: detention risk + broker update template.",
    lastCheckCallAt: null,
  },
  {
    id: "TL-30003",
    status: "Issue",
    priority: "High",
    broker: "Training Broker Three",
    carrierId: "TR-20002",
    carrier: "Training Carrier Bravo",
    lane: "Phoenix, AZ → Las Vegas, NV",
    pickupCity: "Phoenix, AZ",
    pickupAt: daysFromNowISO(0, 7),
    deliveryCity: "Las Vegas, NV",
    deliveryAt: daysFromNowISO(0, 16),
    netRpm: 1.62,
    miles: 302,
    detentionRisk: true,
    notes: "Practice: dock delay → update notes + mark check call.",
    lastCheckCallAt: null,
  },
  {
    id: "TL-30004",
    status: "En Route",
    priority: "Normal",
    broker: "Training Broker Four",
    carrierId: "TR-20001",
    carrier: "Training Carrier Alpha",
    lane: "Newark, NJ → Boston, MA",
    pickupCity: "Newark, NJ",
    pickupAt: daysFromNowISO(0, 6),
    deliveryCity: "Boston, MA",
    deliveryAt: daysFromNowISO(0, 15),
    netRpm: 2.68,
    miles: 316,
    detentionRisk: false,
    notes: "Practice: en route updates + ETA communication.",
    lastCheckCallAt: null,
  },
];

/* -----------------------------
   TRAINING BROKER Seeds (new)
------------------------------ */
const TRAINING_BROKERS = [
  {
    id: "TB-40001",
    name: "Training Broker One",
    email: "ops@tb1.training",
    phone: "(555) 020-4001",
    city: "Chicago, IL",
    riskScore: 22,
    creditScore: 78,
    hot: true,
    lastContactAt: daysFromNowISO(0, 9),
    notes: "Training: practice rate negotiation + load updates.",
    lanePrefs: "CHI → DAL, CHI → ATL. Prefer fast updates.",
  },
  {
    id: "TB-40002",
    name: "Training Broker Two",
    email: "ops@tb2.training",
    phone: "(555) 020-4002",
    city: "Atlanta, GA",
    riskScore: 58,
    creditScore: 60,
    hot: false,
    lastContactAt: daysFromNowISO(-1, 15),
    notes: "Training: practice detention + issue escalation.",
    lanePrefs: "ATL regional. Confirm appt windows + detention terms.",
  },
  {
    id: "TB-40003",
    name: "Training Broker Three",
    email: "ops@tb3.training",
    phone: "(555) 020-4003",
    city: "Phoenix, AZ",
    riskScore: 66,
    creditScore: 52,
    hot: false,
    lastContactAt: daysFromNowISO(-2, 11),
    notes: "Training: practice protecting terms in the rate con.",
    lanePrefs: "AZ → NV / CA. Accessorials must be written.",
  },
  {
    id: "TB-40004",
    name: "Training Broker Four",
    email: "ops@tb4.training",
    phone: "(555) 020-4004",
    city: "Newark, NJ",
    riskScore: 30,
    creditScore: 84,
    hot: true,
    lastContactAt: daysFromNowISO(0, 7),
    notes: "Training: practice clean handoffs + POD requests.",
    lanePrefs: "NE short hauls. POD required within 1 hour of delivery.",
  },
];

/* -----------------------------
   Helpers
------------------------------ */
function nextCarrierId(prefix = "CR") {
  return `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;
}
function nextLoadId(prefix = "LD") {
  return `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;
}
function nextBrokerId(prefix = "BR") {
  return `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;
}

function safeBoolFromLS(key, fallback) {
  const v = localStorage.getItem(key);
  if (v === null || v === undefined) return fallback;
  return v === "true";
}

/* -----------------------------
   Context
------------------------------ */
const DataContext = createContext(null);

export function DataProvider({ children }) {
  // ✅ Training Mode ON by default
  const [trainingMode, setTrainingMode] = useState(() =>
    safeBoolFromLS(LS_TRAINING, true)
  );

  // Keep two data stores: live + training
  const [liveCarriers, setLiveCarriers] = useState(SEED_CARRIERS);
  const [liveLoads, setLiveLoads] = useState(SEED_LOADS);
  const [liveBrokers, setLiveBrokers] = useState(SEED_BROKERS);

  const [trainingCarriers, setTrainingCarriers] = useState(TRAINING_CARRIERS);
  const [trainingLoads, setTrainingLoads] = useState(TRAINING_LOADS);
  const [trainingBrokers, setTrainingBrokers] = useState(TRAINING_BROKERS);

  // persist training mode
  useEffect(() => {
    try {
      localStorage.setItem(LS_TRAINING, String(trainingMode));
    } catch {
      // ignore
    }
  }, [trainingMode]);

  // Derived “active” dataset based on mode
  const carriers = trainingMode ? trainingCarriers : liveCarriers;
  const loads = trainingMode ? trainingLoads : liveLoads;
  const brokers = trainingMode ? trainingBrokers : liveBrokers;

  const setCarriers = trainingMode ? setTrainingCarriers : setLiveCarriers;
  const setLoads = trainingMode ? setTrainingLoads : setLiveLoads;
  const setBrokers = trainingMode ? setTrainingBrokers : setLiveBrokers;

  /* -----------------------------
     Carriers
  ------------------------------ */
  function addCarrier(input) {
    const idRaw = (input?.id || "").trim();
    const id = idRaw || nextCarrierId(trainingMode ? "TR" : "CR");
    const name = (input?.name || "").trim();
    if (!name) return null;

    const carrier = {
      id,
      name,
      status: input.status ?? "Active",
      riskScore: input.riskScore ?? 22,
      mc: input.mc ?? "",
      dot: input.dot ?? "",
      phone: input.phone ?? "",
      email: input.email ?? "",
      homeBase: input.homeBase ?? "",
      equipment: input.equipment ?? "",
      insuranceOnFile: input.insuranceOnFile ?? true,
      insuranceExp: input.insuranceExp ?? "",
      w9OnFile: input.w9OnFile ?? true,
      authorityOnFile: input.authorityOnFile ?? true,
      onTime: input.onTime ?? 0,
      claims: input.claims ?? 0,
      lastContactAt: input.lastContactAt ?? new Date().toISOString(),
      notes: input.notes ?? "",

      // ✅ defaults so Compliance panels always have something
      compliancePerformanceNotes: input.compliancePerformanceNotes ?? "",
      complianceNotes: input.complianceNotes ?? "",
      performanceNotes: input.performanceNotes ?? "",
    };

    setCarriers((prev) => [carrier, ...prev]);
    return carrier;
  }

  function updateCarrier(carrierId, patch) {
    setCarriers((prev) =>
      prev.map((c) => (c.id === carrierId ? { ...c, ...patch } : c))
    );
  }

  /* -----------------------------
     Loads
  ------------------------------ */
  function addLoad(input) {
    const idRaw = (input?.id || "").trim();
    const id = idRaw || nextLoadId(trainingMode ? "TL" : "LD");

    // resolve carrier name from active carriers list
    const carrierObj = input?.carrierId
      ? carriers.find((c) => c.id === input.carrierId)
      : null;
    const carrierName = carrierObj?.name || (input?.carrier || "").trim() || "—";

    const load = {
      id,
      status: input.status ?? "Booked",
      priority: input.priority ?? "Normal",
      broker: input.broker ?? "",
      carrierId: input.carrierId ?? "",
      carrier: carrierName,
      lane: input.lane ?? "",
      pickupCity: input.pickupCity ?? "",
      pickupAt: input.pickupAt ?? "",
      deliveryCity: input.deliveryCity ?? "",
      deliveryAt: input.deliveryAt ?? "",
      miles: Number(input.miles || 0),
      rpm: Number(input.rpm || 0),
      netRpm: Number(input.netRpm || 0),
      notes: input.notes ?? "",
      detentionRisk: !!input.detentionRisk,
      lastCheckCallAt: input.lastCheckCallAt ?? null,
    };

    setLoads((prev) => [load, ...prev]);
    return load;
  }

  function updateLoad(loadId, patch) {
    setLoads((prev) =>
      prev.map((l) => {
        if (l.id !== loadId) return l;

        const next = { ...l, ...patch };

        // If carrierId changes, re-resolve carrier name
        if ("carrierId" in patch) {
          const carrierObj = next.carrierId
            ? carriers.find((c) => c.id === next.carrierId)
            : null;
          next.carrier = carrierObj?.name || next.carrier || "—";
        }

        return next;
      })
    );
  }

  /* -----------------------------
     Brokers (NEW)
  ------------------------------ */
  function addBroker(input) {
    const idRaw = (input?.id || "").trim();
    const id = idRaw || nextBrokerId(trainingMode ? "TB" : "BR");
    const name = (input?.name || "").trim();
    if (!name) return null;

    const broker = {
      id,
      name,
      email: input.email ?? "",
      phone: input.phone ?? "",
      city: input.city ?? "",
      riskScore: Number(input.riskScore ?? 25),
      creditScore: Number(input.creditScore ?? 70),
      hot: !!input.hot,
      lastContactAt: input.lastContactAt ?? new Date().toISOString(),
      notes: input.notes ?? "",
      lanePrefs: input.lanePrefs ?? "",
    };

    setBrokers((prev) => [broker, ...prev]);
    return broker;
  }

  function updateBroker(brokerId, patch) {
    setBrokers((prev) =>
      prev.map((b) => (b.id === brokerId ? { ...b, ...patch } : b))
    );
  }

  /* -----------------------------
     Training Utilities
  ------------------------------ */
  function resetTrainingData() {
    setTrainingCarriers(TRAINING_CARRIERS);
    setTrainingLoads(TRAINING_LOADS);
    setTrainingBrokers(TRAINING_BROKERS);
  }

  const value = useMemo(
    () => ({
      trainingMode,
      setTrainingMode,
      resetTrainingData,

      carriers,
      loads,
      brokers,

      addCarrier,
      updateCarrier,
      addLoad,
      updateLoad,

      addBroker,
      updateBroker,
    }),
    [trainingMode, carriers, loads, brokers]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider />");
  return ctx;
}
