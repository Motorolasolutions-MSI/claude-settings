import { useState, useEffect, useRef, useCallback } from "react";

const AGENTS = [
  {
    id: 1, num: "01", name: "Supplier Risk Monitor", pillar: "sourcing", complexity: "Medium-High", timeline: "10–14 wks",
    tagline: "24/7 early-warning system watching your supply base",
    icon: "🛡️",
    purpose: "Continuously scans global news, financial filings, regulatory databases, and geopolitical intelligence to identify emerging risks. Alerts procurement teams before disruptions cascade into production delays.",
    dataSources: [
      { name: "Supplier Master (ERP/SRM)", type: "internal", refresh: "Daily" },
      { name: "D&B / Altana Financial Health", type: "external", refresh: "Weekly" },
      { name: "News APIs (Reuters, Bloomberg)", type: "external", refresh: "Real-time" },
      { name: "Sanctions Lists (BIS, OFAC)", type: "external", refresh: "Daily" },
      { name: "Weather/Disaster (NOAA, GDACS)", type: "external", refresh: "Real-time" },
      { name: "Port Congestion Data", type: "external", refresh: "Hourly" },
    ],
    architecture: [
      { step: "Ingest", detail: "RSS/API crawlers pull news, filings, sanctions updates on schedule", color: "#3B82F6" },
      { step: "Classify", detail: "NLP engine extracts entities, sentiment, risk signals from unstructured text", color: "#6366F1" },
      { step: "Map", detail: "Knowledge graph links suppliers → sub-tiers → geographies → risk events", color: "#8B5CF6" },
      { step: "Score", detail: "Risk scoring model weights financial, operational, geopolitical factors", color: "#A855F7" },
      { step: "Alert", detail: "Configurable threshold engine routes alerts by severity to right stakeholders", color: "#D946EF" },
      { step: "Report", detail: "Dashboard + Slack/email notifications with weekly risk digest", color: "#EC4899" },
    ],
    outputs: ["Risk scorecards per supplier", "Automated severity-rated alerts", "Alternative supplier suggestions", "Weekly risk digest for leadership"],
    roi: "Reduces unplanned supply disruptions by 40-60%. Cuts supplier qualification time for alternates.",
    demoData: {
      type: "risk_dashboard",
      suppliers: [
        { name: "Flex Ltd.", region: "Asia-Pacific", risk: 72, trend: "up", alerts: ["Financial downgrade Q1", "Factory flood risk - monsoon season"] },
        { name: "Jabil Inc.", region: "Americas", risk: 35, trend: "stable", alerts: ["Port congestion at Long Beach"] },
        { name: "Celestica", region: "EMEA", risk: 58, trend: "up", alerts: ["Sanctions screening flag - sub-tier supplier", "Labor dispute reported"] },
        { name: "Venture Corp", region: "Asia-Pacific", risk: 22, trend: "down", alerts: [] },
        { name: "Sanmina", region: "Americas", risk: 41, trend: "stable", alerts: ["Carrier capacity constraints TX-MX lane"] },
      ]
    }
  },
  {
    id: 2, num: "02", name: "RFQ/RFP Drafting Agent", pillar: "sourcing", complexity: "Medium", timeline: "8–12 wks",
    tagline: "Specs in, structured bids out — with apples-to-apples comparisons",
    icon: "📋",
    purpose: "Automates bid document creation from category specifications and compliance requirements. Normalizes incoming supplier responses into standardized scorecards for rapid evaluation.",
    dataSources: [
      { name: "Historical RFQ/RFP Templates", type: "internal", refresh: "On-demand" },
      { name: "Category Specifications", type: "internal", refresh: "Per project" },
      { name: "Supplier Database", type: "internal", refresh: "Weekly" },
      { name: "Past Bid Responses", type: "internal", refresh: "Archived" },
      { name: "Evaluation Criteria Matrices", type: "internal", refresh: "Per category" },
      { name: "Compliance Checklists", type: "internal", refresh: "Quarterly" },
    ],
    architecture: [
      { step: "Template", detail: "LLM-powered clause generation from specs + compliance requirements", color: "#059669" },
      { step: "Assemble", detail: "Document assembly merges specs, compliance, and commercial terms", color: "#0D9488" },
      { step: "Parse", detail: "Response parser extracts structured data from varied supplier formats", color: "#0891B2" },
      { step: "Normalize", detail: "Standardization engine maps disparate fields to common schema", color: "#0284C7" },
      { step: "Score", detail: "Weighted scoring model evaluates across price, quality, service, risk", color: "#2563EB" },
      { step: "Compare", detail: "Side-by-side dashboard with TCO analysis and recommendation memo", color: "#4F46E5" },
    ],
    outputs: ["Ready-to-issue RFQ/RFP documents", "Normalized bid comparison scorecards", "TCO analysis memos", "Recommendation reports"],
    roi: "Reduces RFQ cycle time by 50-70%. Eliminates manual data entry from bid responses.",
    demoData: {
      type: "rfq_comparison",
      rfq: "RFQ-2026-0487: Domestic LTL Freight Services",
      bidders: [
        { name: "XPO Logistics", price: 847000, transit: 2.3, onTime: 96.2, coverage: 98, score: 88 },
        { name: "Old Dominion", price: 912000, transit: 1.9, onTime: 98.7, coverage: 95, score: 91 },
        { name: "Saia Inc.", price: 795000, transit: 2.8, onTime: 94.1, coverage: 92, score: 82 },
        { name: "Estes Express", price: 831000, transit: 2.5, onTime: 95.8, coverage: 96, score: 85 },
      ]
    }
  },
  {
    id: 3, num: "03", name: "Supplier Performance Tracker", pillar: "sourcing", complexity: "Medium", timeline: "8–10 wks",
    tagline: "Scattered data → living scorecards that drive accountability",
    icon: "📊",
    purpose: "Aggregates delivery, quality, invoice accuracy, and responsiveness data across logistics providers. Generates automated scorecards, trend analysis, and threshold breach alerts.",
    dataSources: [
      { name: "TMS Shipment Data", type: "internal", refresh: "Real-time" },
      { name: "WMS Receiving Records", type: "internal", refresh: "Daily" },
      { name: "AP Invoice Data", type: "internal", refresh: "Daily" },
      { name: "QMS Records", type: "internal", refresh: "Weekly" },
      { name: "Carrier OTD Logs", type: "external", refresh: "Daily" },
      { name: "Customer Complaint Data", type: "internal", refresh: "Daily" },
    ],
    architecture: [
      { step: "Extract", detail: "ETL pipeline pulls from TMS, WMS, ERP, QMS systems", color: "#DC2626" },
      { step: "Warehouse", detail: "Star schema: supplier dimension, metric fact tables, time dimension", color: "#EA580C" },
      { step: "Calculate", detail: "Configurable KPI formulas per category (OTD, quality, cost, responsiveness)", color: "#D97706" },
      { step: "Detect", detail: "Trend detection via rolling averages, regression, anomaly flagging", color: "#CA8A04" },
      { step: "Alert", detail: "Rules engine triggers notifications when KPIs breach thresholds", color: "#65A30D" },
      { step: "Report", detail: "Auto-generated scorecards and QBR slide decks", color: "#16A34A" },
    ],
    outputs: ["Monthly/quarterly supplier scorecards", "Trend analysis with forecasts", "Auto-generated QBR decks", "Supplier ranking leaderboards"],
    roi: "Drives 10-20% improvement in OTD through transparency. Data-backed leverage for negotiations.",
    demoData: {
      type: "performance_cards",
      suppliers: [
        { name: "DHL Supply Chain", otd: 97.2, quality: 99.1, invoiceAcc: 94.5, response: 4.2, overall: "A" },
        { name: "C.H. Robinson", otd: 93.8, quality: 98.4, invoiceAcc: 91.2, response: 6.1, overall: "B+" },
        { name: "Kuehne+Nagel", otd: 95.6, quality: 99.5, invoiceAcc: 96.8, response: 3.8, overall: "A-" },
        { name: "DB Schenker", otd: 91.2, quality: 97.8, invoiceAcc: 89.3, response: 8.4, overall: "B" },
      ]
    }
  },
  {
    id: 4, num: "04", name: "Market Intelligence Agent", pillar: "sourcing", complexity: "Medium-High", timeline: "10–14 wks",
    tagline: "Always-on analyst tracking rates, fuel, and capacity",
    icon: "📡",
    purpose: "Monitors freight rate indices, fuel surcharge trends, lane-level pricing, and capacity signals to inform negotiation timing and contract strategy.",
    dataSources: [
      { name: "Freightos Baltic Index (FBX)", type: "external", refresh: "Daily" },
      { name: "DAT Load-to-Truck Ratios", type: "external", refresh: "Daily" },
      { name: "EIA Diesel Price Data", type: "external", refresh: "Weekly" },
      { name: "Drewry/Xeneta Ocean Rates", type: "external", refresh: "Weekly" },
      { name: "Carrier Earnings Calls", type: "external", refresh: "Quarterly" },
      { name: "PMI / Port Throughput Stats", type: "external", refresh: "Monthly" },
    ],
    architecture: [
      { step: "Aggregate", detail: "Multi-source data aggregation from rate indices, capacity feeds, macro data", color: "#7C3AED" },
      { step: "Store", detail: "Time-series database for historical rate/capacity/volume data", color: "#6D28D9" },
      { step: "Forecast", detail: "ARIMA/Prophet models for rate prediction; regression for capacity", color: "#5B21B6" },
      { step: "Detect", detail: "Anomaly detection flags unusual rate spikes or capacity crunches", color: "#4C1D95" },
      { step: "Narrate", detail: "LLM generates natural language market briefings from data", color: "#3B0764" },
      { step: "Visualize", detail: "Interactive dashboard with scenario modeling tools", color: "#581C87" },
    ],
    outputs: ["Weekly market briefings", "Lane-level pricing trends", "Negotiation timing recommendations", "Contract benchmarking analysis"],
    roi: "Enables 5-15% savings through better-timed negotiations. Prevents overpaying during rate spikes.",
    demoData: {
      type: "market_rates",
      lanes: [
        { lane: "Shanghai → LA", current: 4250, prev: 3890, forecast: 4600, trend: "up" },
        { lane: "Rotterdam → NY", current: 3100, prev: 3450, forecast: 2950, trend: "down" },
        { lane: "Chicago → Dallas", current: 2.85, prev: 2.72, forecast: 2.95, trend: "up" },
        { lane: "LA → Chicago", current: 3.42, prev: 3.68, forecast: 3.15, trend: "down" },
      ]
    }
  },
  {
    id: 5, num: "05", name: "Contract Clause Analyzer", pillar: "compliance", complexity: "Medium-High", timeline: "12–16 wks",
    tagline: "Reads every clause so you don't have to — and flags what matters",
    icon: "⚖️",
    purpose: "Reviews logistics contracts against your standard playbook. Identifies unfavorable terms, missing SLAs, liability exposure, auto-renewal traps, and deviation from preferred language.",
    dataSources: [
      { name: "Contract Repository (CLM)", type: "internal", refresh: "On-demand" },
      { name: "Standard Clause Library", type: "internal", refresh: "Quarterly" },
      { name: "Historical Negotiation Outcomes", type: "internal", refresh: "Archived" },
      { name: "Deviation Thresholds", type: "internal", refresh: "Quarterly" },
      { name: "Regulatory Requirements", type: "external", refresh: "Monthly" },
    ],
    architecture: [
      { step: "Ingest", detail: "OCR for scanned contracts, PDF parser for digital; text extraction", color: "#B91C1C" },
      { step: "Segment", detail: "NLP-based section identification (indemnity, liability, SLA, payment, termination)", color: "#DC2626" },
      { step: "Classify", detail: "Clause classification model trained on your playbook categories", color: "#EF4444" },
      { step: "Compare", detail: "Deviation scoring engine compares against standard preferred language", color: "#F87171" },
      { step: "Flag", detail: "Risk flagging with severity levels (critical, warning, informational)", color: "#FCA5A5" },
      { step: "Suggest", detail: "Redline suggestion generator with alternative clause language", color: "#FECACA" },
    ],
    outputs: ["Clause deviation reports", "Risk heatmaps", "Suggested redline language", "Contract comparison matrices", "Renewal calendar"],
    roi: "Reduces legal review time by 60-80%. Catches unfavorable terms that slip through manual review.",
    demoData: {
      type: "clause_analysis",
      contract: "MSA-2026-Freight-KN",
      clauses: [
        { clause: "Liability Cap", status: "critical", deviation: "Capped at 2x freight charges vs. standard full replacement value", playbook: "Full declared value" },
        { clause: "Payment Terms", status: "warning", deviation: "Net 15 vs. standard Net 45", playbook: "Net 30-45" },
        { clause: "Auto-Renewal", status: "critical", deviation: "60-day notice required, auto-renews for 24 months", playbook: "30-day notice, 12-month renewal" },
        { clause: "Force Majeure", status: "ok", deviation: "Aligned with standard language", playbook: "Mutual FM clause" },
        { clause: "Indemnification", status: "warning", deviation: "Carve-out for consequential damages", playbook: "Mutual indemnification, no carve-outs" },
        { clause: "SLA Penalties", status: "critical", deviation: "No penalty clause for missed OTD targets", playbook: "Credit of 2% per 1% below 95% OTD" },
      ]
    }
  },
  {
    id: 6, num: "06", name: "Trade Compliance Agent", pillar: "compliance", complexity: "High", timeline: "14–20 wks",
    tagline: "Catches export control and sanctions issues before goods leave the dock",
    icon: "🌐",
    purpose: "Cross-references shipments against HTS codes, export controls (EAR/ITAR — critical for Motorola Solutions), denied party lists, and FTA eligibility. Flags compliance issues pre-shipment.",
    dataSources: [
      { name: "Product Master (ECCN/USML)", type: "internal", refresh: "Per change" },
      { name: "HTS Code Databases", type: "external", refresh: "Monthly" },
      { name: "BIS Entity List", type: "external", refresh: "Daily" },
      { name: "OFAC SDN List", type: "external", refresh: "Daily" },
      { name: "FTA Rules of Origin", type: "external", refresh: "Quarterly" },
      { name: "End-Use Documentation", type: "internal", refresh: "Per shipment" },
    ],
    architecture: [
      { step: "Intake", detail: "Shipment data: PO + product details + destination + end-user", color: "#0E7490" },
      { step: "Classify", detail: "Maps products to HTS/ECCN codes; flags ITAR-controlled items", color: "#0891B2" },
      { step: "Screen", detail: "Denied party, embargo, sanctions checks across all relevant lists", color: "#06B6D4" },
      { step: "License", detail: "License determination engine applies EAR/ITAR rules per destination", color: "#22D3EE" },
      { step: "FTA", detail: "FTA eligibility calculator identifies duty savings opportunities", color: "#67E8F9" },
      { step: "Audit", detail: "Exception queue + audit trail for every screening decision", color: "#A5F3FC" },
    ],
    outputs: ["Pre-shipment compliance clearance/hold", "Denied-party screening results", "License requirement notifications", "FTA savings opportunities", "Audit-ready logs"],
    roi: "Prevents penalties (EAR violations >$300K each). Reduces screening time by 70%. Captures missed FTA savings.",
    demoData: {
      type: "compliance_check",
      shipments: [
        { id: "SHP-44821", product: "P25 Digital Radio", dest: "United Arab Emirates", eccn: "5A001.b.2", status: "hold", reason: "License required — EAR 5A001, destination review" },
        { id: "SHP-44822", product: "Body Camera BWC", dest: "Canada", eccn: "EAR99", status: "clear", reason: "No restrictions — EAR99, FTA eligible (USMCA)" },
        { id: "SHP-44823", product: "Command Center SW", dest: "Saudi Arabia", eccn: "5D002", status: "review", reason: "Encryption classification — 5D002 may require BIS notification" },
        { id: "SHP-44824", product: "APX NEXT Radio", dest: "Mexico", eccn: "5A001.b.2", status: "clear", reason: "License Exception STA applicable — strategic trade authorization" },
      ]
    }
  },
  {
    id: 7, num: "07", name: "Customs Documentation Agent", pillar: "compliance", complexity: "Medium", timeline: "8–12 wks",
    tagline: "Auto-generates every export document so shipments clear customs first try",
    icon: "📄",
    purpose: "Generates commercial invoices, packing lists, certificates of origin, and customs declarations from order data. Validates completeness and accuracy before submission.",
    dataSources: [
      { name: "ERP Order/Shipment Data", type: "internal", refresh: "Real-time" },
      { name: "Product Master (HTS, weights)", type: "internal", refresh: "Per change" },
      { name: "Carrier Booking Data", type: "external", refresh: "Per shipment" },
      { name: "Broker Requirements", type: "external", refresh: "Quarterly" },
      { name: "Customs Tariff Databases", type: "external", refresh: "Monthly" },
    ],
    architecture: [
      { step: "Extract", detail: "Pull order, product, and shipment data from ERP automatically", color: "#4338CA" },
      { step: "Template", detail: "Country/carrier-specific document format selection", color: "#4F46E5" },
      { step: "Populate", detail: "Auto-fill values, weights, HTS codes, country of origin fields", color: "#6366F1" },
      { step: "Validate", detail: "Completeness, format, consistency checks across all documents", color: "#818CF8" },
      { step: "Reconcile", detail: "Cross-document checks: invoice vs. packing list vs. BOL", color: "#A5B4FC" },
      { step: "Submit", detail: "Digital package to broker portals with status tracking", color: "#C7D2FE" },
    ],
    outputs: ["Complete customs document packages", "Validation error reports", "Document status tracking", "Broker-ready file packages"],
    roi: "Eliminates 90% of manual doc prep time. Reduces customs delays from errors by 80%.",
    demoData: {
      type: "doc_status",
      shipments: [
        { id: "SHP-44821", docs: [
          { name: "Commercial Invoice", status: "complete", validated: true },
          { name: "Packing List", status: "complete", validated: true },
          { name: "Certificate of Origin", status: "pending", validated: false },
          { name: "SLI", status: "complete", validated: true },
        ]},
        { id: "SHP-44822", docs: [
          { name: "Commercial Invoice", status: "complete", validated: true },
          { name: "Packing List", status: "complete", validated: true },
          { name: "USMCA Certificate", status: "complete", validated: true },
          { name: "Bill of Lading", status: "complete", validated: true },
        ]},
      ]
    }
  },
  {
    id: 8, num: "08", name: "Freight Spend Analyzer", pillar: "operations", complexity: "Medium", timeline: "8–10 wks",
    tagline: "Finds money hiding in your freight invoices — overcharges, errors, missed discounts",
    icon: "💰",
    purpose: "Parses carrier invoices, matches against contracted rates, identifies billing errors, accessorial overcharges, and duplicate payments. Surfaces savings by lane, mode, and carrier.",
    dataSources: [
      { name: "Carrier Invoices (EDI 210/PDF)", type: "external", refresh: "Daily" },
      { name: "Rate Contracts & Tariffs", type: "internal", refresh: "Per contract" },
      { name: "TMS Shipment Records", type: "internal", refresh: "Real-time" },
      { name: "GL Freight Spend Data", type: "internal", refresh: "Monthly" },
      { name: "Fuel Surcharge Schedules", type: "external", refresh: "Weekly" },
    ],
    architecture: [
      { step: "Ingest", detail: "EDI parser + OCR for paper invoices; line-item extraction", color: "#B45309" },
      { step: "Extract", detail: "Itemize charges: base rate, fuel, accessorials, taxes, fees", color: "#D97706" },
      { step: "Match", detail: "Rate matching: contracted vs. billed by lane/weight/service level", color: "#EAB308" },
      { step: "Audit", detail: "Accessorial audit rules; duplicate detection via fuzzy matching", color: "#84CC16" },
      { step: "Quantify", detail: "Savings waterfall: overcharges, rate errors, duplicate payments", color: "#22C55E" },
      { step: "Dispute", detail: "Auto-generated dispute files with evidence for carrier claims", color: "#10B981" },
    ],
    outputs: ["Invoice audit reports", "Savings opportunity dashboards", "Carrier dispute files", "Spend analytics by lane/mode", "Accessorial trend analysis"],
    roi: "Typically recovers 2-5% of total freight spend. Identifies systemic billing issues.",
    demoData: {
      type: "spend_audit",
      total: 24500000,
      findings: [
        { type: "Rate Overcharges", amount: 487000, count: 342, pct: 1.99 },
        { type: "Accessorial Errors", amount: 312000, count: 567, pct: 1.27 },
        { type: "Duplicate Payments", amount: 156000, count: 23, pct: 0.64 },
        { type: "Fuel Surcharge Errors", amount: 98000, count: 189, pct: 0.40 },
        { type: "Weight/Dim Discrepancies", amount: 73000, count: 156, pct: 0.30 },
      ]
    }
  },
  {
    id: 9, num: "09", name: "Shipment ETA Predictor", pillar: "operations", complexity: "High", timeline: "12–16 wks",
    tagline: "Probabilistic arrival windows you can actually plan around",
    icon: "🕐",
    purpose: "Combines real-time tracking, port congestion, weather, and historical transit data to generate probabilistic arrival windows for downstream planning.",
    dataSources: [
      { name: "Carrier Tracking APIs", type: "external", refresh: "Real-time" },
      { name: "AIS Vessel Tracking", type: "external", refresh: "Real-time" },
      { name: "Port Congestion Indices", type: "external", refresh: "Hourly" },
      { name: "NOAA Weather Data", type: "external", refresh: "6-hourly" },
      { name: "Historical Transit Times", type: "internal", refresh: "Daily" },
      { name: "Customs Clearance Logs", type: "internal", refresh: "Daily" },
    ],
    architecture: [
      { step: "Track", detail: "Real-time tracking data ingestion from carriers, AIS, port systems", color: "#0369A1" },
      { step: "Engineer", detail: "Feature engineering: location, progress, weather, port dwell times", color: "#0284C7" },
      { step: "Predict", detail: "Gradient boosted trees trained on historical actuals for ETA ranges", color: "#0EA5E9" },
      { step: "Quantify", detail: "Confidence interval generator: 80% / 95% probability windows", color: "#38BDF8" },
      { step: "Alert", detail: "Exception alerting for high probability of late arrival", color: "#7DD3FC" },
      { step: "Notify", detail: "Downstream notifications to warehouse, production, customer service", color: "#BAE6FD" },
    ],
    outputs: ["Probabilistic ETA ranges", "At-risk shipment alerts", "Daily status dashboards", "Accuracy reports", "Downstream planning notifications"],
    roi: "Improves warehouse labor planning by 20-30%. Reduces expediting costs through earlier intervention.",
    demoData: {
      type: "eta_predictions",
      shipments: [
        { id: "OCN-8834", origin: "Shanghai", dest: "Long Beach", carrier: "Maersk", originalEta: "May 12", predictedEta: "May 14-16", confidence: 82, status: "delayed", reason: "Port congestion + weather system" },
        { id: "AIR-2291", origin: "Frankfurt", dest: "Chicago ORD", carrier: "Lufthansa Cargo", originalEta: "May 3", predictedEta: "May 3", confidence: 96, status: "on-time", reason: "On schedule" },
        { id: "TRK-5567", origin: "Monterrey", dest: "Schaumburg IL", carrier: "XPO", originalEta: "May 5", predictedEta: "May 5-6", confidence: 74, status: "at-risk", reason: "Border congestion at Laredo" },
        { id: "OCN-8901", origin: "Penang", dest: "Savannah", carrier: "ONE", originalEta: "May 20", predictedEta: "May 18-19", confidence: 88, status: "early", reason: "Favorable currents, no port delays" },
      ]
    }
  },
  {
    id: 10, num: "10", name: "Mode & Route Optimizer", pillar: "operations", complexity: "High", timeline: "14–18 wks",
    tagline: "Smartest way to move every shipment — cost, speed, and carbon",
    icon: "🗺️",
    purpose: "Evaluates optimal transport modes and routing for each shipment based on cost, transit time, carbon emissions, and service requirements.",
    dataSources: [
      { name: "Rate Databases by Mode/Lane", type: "internal", refresh: "Per contract" },
      { name: "Transit Time Tables", type: "internal", refresh: "Monthly" },
      { name: "Carbon Emission Factors (GLEC)", type: "external", refresh: "Annually" },
      { name: "Shipment Urgency Classification", type: "internal", refresh: "Per order" },
      { name: "Carrier Capacity Data", type: "external", refresh: "Daily" },
      { name: "Fuel Price Data", type: "external", refresh: "Weekly" },
    ],
    architecture: [
      { step: "Intake", detail: "Shipment requirements: origin, destination, weight, urgency, value", color: "#166534" },
      { step: "Generate", detail: "Multi-modal option generator: air, ocean, ground, intermodal combos", color: "#15803D" },
      { step: "Cost", detail: "All-in landed cost calculator including duties, handling, insurance", color: "#16A34A" },
      { step: "Estimate", detail: "Transit time estimator per mode and routing option", color: "#22C55E" },
      { step: "Carbon", detail: "Carbon calculator per GLEC framework for ESG reporting", color: "#4ADE80" },
      { step: "Optimize", detail: "Multi-objective optimization: Pareto frontier with scenario comparison", color: "#86EFAC" },
    ],
    outputs: ["Mode/route recommendations", "Cost-time-carbon trade-off charts", "Scenario comparisons", "Carbon footprint reports", "Network optimization insights"],
    roi: "Reduces transportation costs by 8-15%. Supports ESG goals. Prevents over-spending on expedited freight.",
    demoData: {
      type: "route_options",
      shipment: { origin: "Penang, Malaysia", dest: "Schaumburg, IL", weight: "12,400 kg", value: "$2.1M" },
      options: [
        { mode: "Ocean FCL", cost: 4200, transit: 32, carbon: 1.2, score: 78 },
        { mode: "Ocean + Rail", cost: 4800, transit: 28, carbon: 1.4, score: 82 },
        { mode: "Air Freight", cost: 18500, transit: 4, carbon: 8.9, score: 61 },
        { mode: "Air + Ground", cost: 16200, transit: 5, carbon: 7.2, score: 65 },
      ]
    }
  },
  {
    id: 11, num: "11", name: "Demand-Supply Matching Agent", pillar: "operations", complexity: "Medium-High", timeline: "10–14 wks",
    tagline: "Connects procurement signals to logistics capacity before bottlenecks form",
    icon: "🔗",
    purpose: "Links procurement signals (POs, forecasts, schedules) with logistics capacity to pre-book warehouse space, transport, and labor before constraints emerge.",
    dataSources: [
      { name: "ERP Purchase Orders", type: "internal", refresh: "Real-time" },
      { name: "Demand Forecasts", type: "internal", refresh: "Weekly" },
      { name: "Production Schedules (MRP)", type: "internal", refresh: "Weekly" },
      { name: "WMS Capacity Data", type: "internal", refresh: "Daily" },
      { name: "Carrier Capacity Commitments", type: "external", refresh: "Weekly" },
      { name: "Seasonal Demand Patterns", type: "internal", refresh: "Quarterly" },
    ],
    architecture: [
      { step: "Aggregate", detail: "Demand signal aggregation: POs + forecasts + production schedules", color: "#9333EA" },
      { step: "Project", detail: "Inbound volume projection by time period and location", color: "#A855F7" },
      { step: "Calculate", detail: "Capacity needs: warehouse space, dock doors, labor, transport units", color: "#C084FC" },
      { step: "Analyze", detail: "Gap analysis: projected need vs. committed capacity by week", color: "#D8B4FE" },
      { step: "Recommend", detail: "Pre-booking recommendations with carrier/warehouse reservations", color: "#E9D5FF" },
      { step: "Alert", detail: "Capacity shortfall alerts with lead time for corrective action", color: "#F3E8FF" },
    ],
    outputs: ["Capacity requirement forecasts", "Pre-booking recommendations", "Gap analysis dashboards", "Carrier/warehouse reservation triggers"],
    roi: "Reduces overtime and expediting by 25-40%. Improves carrier rate compliance through advance booking.",
    demoData: {
      type: "capacity_gaps",
      weeks: [
        { week: "W19", demand: 340, capacity: 400, gap: 0, status: "ok" },
        { week: "W20", demand: 420, capacity: 400, gap: 20, status: "warning" },
        { week: "W21", demand: 580, capacity: 400, gap: 180, status: "critical" },
        { week: "W22", demand: 510, capacity: 450, gap: 60, status: "warning" },
        { week: "W23", demand: 380, capacity: 450, gap: 0, status: "ok" },
        { week: "W24", demand: 360, capacity: 400, gap: 0, status: "ok" },
      ]
    }
  },
  {
    id: 12, num: "12", name: "PO-to-Invoice Reconciliation", pillar: "automation", complexity: "Medium", timeline: "8–12 wks",
    tagline: "Automates three-way matching so your team handles exceptions, not data entry",
    icon: "🔄",
    purpose: "Automates three-way match between POs, goods receipts, and invoices. Identifies discrepancies and routes exceptions with context for human review.",
    dataSources: [
      { name: "ERP Purchase Orders", type: "internal", refresh: "Real-time" },
      { name: "Goods Receipt / ASN Data", type: "internal", refresh: "Daily" },
      { name: "Supplier Invoices (EDI/PDF)", type: "external", refresh: "Daily" },
      { name: "Contract Rate Cards", type: "internal", refresh: "Per contract" },
      { name: "Tolerance Thresholds", type: "internal", refresh: "Quarterly" },
    ],
    architecture: [
      { step: "Intake", detail: "Invoice intake via EDI 810 + OCR for paper invoices", color: "#E11D48" },
      { step: "Extract", detail: "Data extraction and normalization to common schema", color: "#F43F5E" },
      { step: "Match PO", detail: "Fuzzy matching on PO numbers, line items, quantities", color: "#FB7185" },
      { step: "Match GR", detail: "Goods receipt reconciliation: quantity and date validation", color: "#FDA4AF" },
      { step: "Validate", detail: "Price validation against contracted rates + tolerance check", color: "#FECDD3" },
      { step: "Route", detail: "Auto-approve within tolerance; exception queue with context for reviewers", color: "#FFF1F2" },
    ],
    outputs: ["Auto-approved invoices (straight-through)", "Exception reports with root cause", "Match rate dashboards", "Supplier accuracy scorecards"],
    roi: "Achieves 70-85% straight-through processing. Reduces AP cost per invoice by 60%.",
    demoData: {
      type: "matching_stats",
      stats: { total: 4280, autoApproved: 3382, exceptions: 898, matchRate: 79 },
      exceptions: [
        { invoice: "INV-88432", po: "PO-2026-4421", type: "Price Variance", amount: "$1,240", status: "Pending Review" },
        { invoice: "INV-88445", po: "PO-2026-4398", type: "Quantity Mismatch", amount: "12 units short", status: "Escalated" },
        { invoice: "INV-88451", po: "PO-2026-4405", type: "Duplicate Invoice", amount: "$8,750", status: "Auto-Flagged" },
        { invoice: "INV-88460", po: "N/A", type: "No PO Match", amount: "$3,200", status: "Pending Review" },
      ]
    }
  },
  {
    id: 13, num: "13", name: "Category Spend Reporter", pillar: "automation", complexity: "Medium", timeline: "6–8 wks",
    tagline: "Scattered spend data → one clear picture, automatically",
    icon: "📈",
    purpose: "Aggregates spend from ERP, TMS, and procurement systems into periodic dashboards by category, region, and supplier. Highlights variance against budget and surfaces trends.",
    dataSources: [
      { name: "ERP General Ledger", type: "internal", refresh: "Daily" },
      { name: "TMS Shipment Costs", type: "internal", refresh: "Daily" },
      { name: "Procurement PO Data", type: "internal", refresh: "Real-time" },
      { name: "Budget/Forecast Files", type: "internal", refresh: "Monthly" },
      { name: "Contract Commitment Data", type: "internal", refresh: "Per contract" },
    ],
    architecture: [
      { step: "ETL", detail: "Scheduled extraction from ERP, TMS, procurement systems", color: "#0F766E" },
      { step: "Classify", detail: "Spend taxonomy mapping + ML classifier for miscoded items", color: "#0D9488" },
      { step: "Cube", detail: "Multi-dimensional data cube: category × supplier × region × time", color: "#14B8A6" },
      { step: "Analyze", detail: "Variance analysis: actual vs. budget, period-over-period trends", color: "#2DD4BF" },
      { step: "Narrate", detail: "LLM-powered commentary on key movements and anomalies", color: "#5EEAD4" },
      { step: "Distribute", detail: "Dashboards + scheduled email/Slack distribution to stakeholders", color: "#99F6E4" },
    ],
    outputs: ["Monthly/quarterly spend dashboards", "Budget variance reports", "Supplier concentration analysis", "Savings tracking", "Executive summary decks"],
    roi: "Saves 20+ hours/month on manual reporting. Catches budget overruns weeks earlier.",
    demoData: {
      type: "spend_overview",
      categories: [
        { name: "Ocean Freight", actual: 8200000, budget: 7800000, variance: 5.1 },
        { name: "Air Freight", actual: 6100000, budget: 6500000, variance: -6.2 },
        { name: "Domestic Trucking", actual: 4300000, budget: 4200000, variance: 2.4 },
        { name: "Warehousing", actual: 3100000, budget: 3000000, variance: 3.3 },
        { name: "Customs Brokerage", actual: 1800000, budget: 1900000, variance: -5.3 },
        { name: "Last Mile", actual: 1500000, budget: 1600000, variance: -6.3 },
      ]
    }
  },
  {
    id: 14, num: "14", name: "Stakeholder Communication Agent", pillar: "automation", complexity: "Low-Medium", timeline: "4–6 wks",
    tagline: "Keeps every internal partner informed without you writing a single email",
    icon: "✉️",
    purpose: "Auto-generates tailored status updates for different audiences (supply chain, finance, ops, leadership) from all upstream data sources.",
    dataSources: [
      { name: "All Upstream Agent Outputs", type: "internal", refresh: "Real-time" },
      { name: "Procurement Project Tracker", type: "internal", refresh: "Daily" },
      { name: "Savings Database", type: "internal", refresh: "Monthly" },
      { name: "Contract Management System", type: "internal", refresh: "Daily" },
      { name: "Shipment Exception Logs", type: "internal", refresh: "Real-time" },
    ],
    architecture: [
      { step: "Aggregate", detail: "Pulls data from all other agents and operational systems", color: "#C2410C" },
      { step: "Profile", detail: "Audience profiling: what each stakeholder group cares about", color: "#EA580C" },
      { step: "Select", detail: "Content selection engine filters by relevance and recency", color: "#F97316" },
      { step: "Generate", detail: "LLM narrative generator with tone appropriate per audience", color: "#FB923C" },
      { step: "Format", detail: "Template engine: email, Slack, deck format per channel", color: "#FDBA74" },
      { step: "Distribute", detail: "Optional human approval queue + scheduled distribution", color: "#FED7AA" },
    ],
    outputs: ["Weekly procurement status emails", "Monthly savings reports", "Exception summaries for ops", "Executive dashboards", "Meeting prep briefs"],
    roi: "Saves 10+ hrs/week on communication prep. Ensures consistent messaging across stakeholders.",
    demoData: {
      type: "comms_preview",
      messages: [
        { audience: "Leadership", subject: "Procurement Weekly: $1.1M in Savings Identified", preview: "Key highlights: 3 RFQs completed with avg 12% cost reduction. 2 suppliers flagged for risk review. Ocean freight rates trending down 4% — renegotiation window opening." },
        { audience: "Finance", subject: "April Spend Report: +2.1% vs Budget", preview: "Ocean freight drove the variance (+$400K) due to Red Sea rerouting surcharges. Air freight came in under budget (-$400K) from mode shift to ocean on non-critical lanes." },
        { audience: "Operations", subject: "Logistics Exceptions This Week: 7 Active", preview: "3 delayed ocean shipments (port congestion LA), 2 customs holds (documentation issues), 1 carrier capacity miss (TX lane), 1 quality claim in process." },
      ]
    }
  },
];

const PILLARS = {
  sourcing: { label: "Sourcing & Supplier Mgmt", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  compliance: { label: "Contract & Compliance", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  operations: { label: "Operational Efficiency", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  automation: { label: "Process Automation", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
};

// — Components —

function RiskBar({ value, max = 100 }) {
  const color = value > 60 ? "#EF4444" : value > 40 ? "#F59E0B" : "#22C55E";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 28 }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    critical: { bg: "#FEE2E2", color: "#DC2626", label: "CRITICAL" },
    warning: { bg: "#FEF3C7", color: "#D97706", label: "WARNING" },
    ok: { bg: "#D1FAE5", color: "#059669", label: "OK" },
    hold: { bg: "#FEE2E2", color: "#DC2626", label: "HOLD" },
    clear: { bg: "#D1FAE5", color: "#059669", label: "CLEAR" },
    review: { bg: "#FEF3C7", color: "#D97706", label: "REVIEW" },
    delayed: { bg: "#FEE2E2", color: "#DC2626", label: "DELAYED" },
    "on-time": { bg: "#D1FAE5", color: "#059669", label: "ON TIME" },
    "at-risk": { bg: "#FEF3C7", color: "#D97706", label: "AT RISK" },
    early: { bg: "#DBEAFE", color: "#2563EB", label: "EARLY" },
    complete: { bg: "#D1FAE5", color: "#059669", label: "✓" },
    pending: { bg: "#FEF3C7", color: "#D97706", label: "…" },
  };
  const s = map[status] || { bg: "#F1F5F9", color: "#64748B", label: status };
  return (
    <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function MiniBar({ value, max, color = "#3B82F6" }) {
  return (
    <div style={{ width: "100%", height: 6, background: "#1E293B", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
    </div>
  );
}

// — Demo Renderers —

function DemoRiskDashboard({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Live Supplier Risk Scores</div>
      {data.suppliers.map((s, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: "12px 16px", border: "1px solid #1E293B" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 14 }}>{s.name}</span>
              <span style={{ color: "#64748B", fontSize: 12, marginLeft: 8 }}>{s.region}</span>
            </div>
            <span style={{ fontSize: 11, color: s.trend === "up" ? "#EF4444" : s.trend === "down" ? "#22C55E" : "#94A3B8" }}>
              {s.trend === "up" ? "▲ Rising" : s.trend === "down" ? "▼ Improving" : "● Stable"}
            </span>
          </div>
          <RiskBar value={s.risk} />
          {s.alerts.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {s.alerts.map((a, j) => (
                <div key={j} style={{ fontSize: 12, color: "#F59E0B", paddingLeft: 12, borderLeft: "2px solid #F59E0B33" }}>⚠ {a}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DemoRfqComparison({ data }) {
  const maxPrice = Math.max(...data.bidders.map(b => b.price));
  return (
    <div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{data.rfq}</div>
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {data.bidders.sort((a, b) => b.score - a.score).map((b, i) => (
          <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 14, border: i === 0 ? "1px solid #22C55E44" : "1px solid #1E293B", position: "relative" }}>
            {i === 0 && <span style={{ position: "absolute", top: -8, right: 12, background: "#22C55E", color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>RECOMMENDED</span>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 14 }}>{b.name}</span>
              <span style={{ color: "#3B82F6", fontWeight: 800, fontSize: 18 }}>{b.score}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
              {[
                { label: "Annual Cost", value: `$${(b.price / 1000).toFixed(0)}K`, pct: b.price / maxPrice, color: "#EF4444" },
                { label: "Avg Transit", value: `${b.transit} days`, pct: 1 - (b.transit / 4), color: "#3B82F6" },
                { label: "On-Time %", value: `${b.onTime}%`, pct: b.onTime / 100, color: "#22C55E" },
                { label: "Coverage", value: `${b.coverage}%`, pct: b.coverage / 100, color: "#A855F7" },
              ].map((m, j) => (
                <div key={j}>
                  <div style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600 }}>{m.value}</div>
                  <MiniBar value={m.pct} max={1} color={m.color} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoPerformanceCards({ data }) {
  const gradeColor = g => g.startsWith("A") ? "#22C55E" : g.startsWith("B") ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {data.suppliers.map((s, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 14, border: "1px solid #1E293B" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 13 }}>{s.name}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: gradeColor(s.overall) }}>{s.overall}</span>
          </div>
          {[
            { label: "On-Time Delivery", val: s.otd, target: 95 },
            { label: "Quality", val: s.quality, target: 99 },
            { label: "Invoice Accuracy", val: s.invoiceAcc, target: 95 },
          ].map((m, j) => (
            <div key={j} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>
                <span>{m.label}</span>
                <span style={{ color: m.val >= m.target ? "#22C55E" : "#F59E0B" }}>{m.val}%</span>
              </div>
              <MiniBar value={m.val} max={100} color={m.val >= m.target ? "#22C55E" : "#F59E0B"} />
            </div>
          ))}
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>Response Time: <span style={{ color: "#E2E8F0" }}>{s.response} hrs</span></div>
        </div>
      ))}
    </div>
  );
}

function DemoMarketRates({ data }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Rate Intelligence — Key Lanes</div>
      {data.lanes.map((l, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 14, border: "1px solid #1E293B", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 13 }}>{l.lane}</span>
            <span style={{ fontSize: 11, color: l.trend === "up" ? "#EF4444" : "#22C55E", fontWeight: 700 }}>
              {l.trend === "up" ? "▲ RISING" : "▼ FALLING"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {[
              { label: "Current", value: l.current > 100 ? `$${l.current.toLocaleString()}` : `$${l.current}/mi` },
              { label: "Previous", value: l.prev > 100 ? `$${l.prev.toLocaleString()}` : `$${l.prev}/mi` },
              { label: "30d Forecast", value: l.forecast > 100 ? `$${l.forecast.toLocaleString()}` : `$${l.forecast}/mi` },
            ].map((m, j) => (
              <div key={j}>
                <div style={{ fontSize: 10, color: "#64748B" }}>{m.label}</div>
                <div style={{ fontSize: 14, color: j === 2 ? (l.trend === "up" ? "#EF4444" : "#22C55E") : "#E2E8F0", fontWeight: 700 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DemoClauseAnalysis({ data }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{data.contract}</div>
      {data.clauses.map((c, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 12, border: "1px solid #1E293B", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 13 }}>{c.clause}</span>
            <StatusBadge status={c.status} />
          </div>
          <div style={{ fontSize: 12, color: "#F59E0B", marginBottom: 4 }}>Found: {c.deviation}</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>Playbook: {c.playbook}</div>
        </div>
      ))}
    </div>
  );
}

function DemoComplianceCheck({ data }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pre-Shipment Screening Results</div>
      {data.shipments.map((s, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 12, border: "1px solid #1E293B", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 13 }}>{s.id}</span>
              <span style={{ color: "#64748B", fontSize: 12, marginLeft: 8 }}>→ {s.dest}</span>
            </div>
            <StatusBadge status={s.status} />
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>{s.product} · <span style={{ color: "#A5B4FC" }}>ECCN: {s.eccn}</span></div>
          <div style={{ fontSize: 12, color: s.status === "clear" ? "#22C55E" : "#F59E0B", marginTop: 4 }}>{s.reason}</div>
        </div>
      ))}
    </div>
  );
}

function DemoDocStatus({ data }) {
  return (
    <div>
      {data.shipments.map((s, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "#F8FAFC", fontWeight: 700, marginBottom: 8 }}>{s.id}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {s.docs.map((d, j) => (
              <div key={j} style={{ background: "#0F172A", borderRadius: 6, padding: "8px 12px", border: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#CBD5E1" }}>{d.name}</span>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DemoSpendAudit({ data }) {
  const maxAmt = Math.max(...data.findings.map(f => f.amount));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>Total Freight Spend Audited</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC" }}>${(data.total / 1e6).toFixed(1)}M</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>Total Recovery Identified</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#22C55E" }}>${(data.findings.reduce((a, f) => a + f.amount, 0) / 1e6).toFixed(2)}M</div>
        </div>
      </div>
      {data.findings.map((f, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 12, border: "1px solid #1E293B", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: "#E2E8F0", fontWeight: 600, fontSize: 13 }}>{f.type}</span>
            <span style={{ color: "#22C55E", fontWeight: 800 }}>${(f.amount / 1000).toFixed(0)}K</span>
          </div>
          <MiniBar value={f.amount} max={maxAmt} color="#22C55E" />
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{f.count} instances · {f.pct}% of spend</div>
        </div>
      ))}
    </div>
  );
}

function DemoEtaPredictions({ data }) {
  return (
    <div>
      {data.shipments.map((s, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 12, border: "1px solid #1E293B", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 13 }}>{s.id}</span>
              <span style={{ color: "#64748B", fontSize: 12, marginLeft: 8 }}>{s.carrier}</span>
            </div>
            <StatusBadge status={s.status} />
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>{s.origin} → {s.dest}</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Carrier ETA</div>
              <div style={{ fontSize: 13, color: "#E2E8F0" }}>{s.originalEta}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Predicted</div>
              <div style={{ fontSize: 13, color: "#F8FAFC", fontWeight: 700 }}>{s.predictedEta}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Confidence</div>
              <div style={{ fontSize: 13, color: s.confidence > 85 ? "#22C55E" : "#F59E0B", fontWeight: 700 }}>{s.confidence}%</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6, fontStyle: "italic" }}>{s.reason}</div>
        </div>
      ))}
    </div>
  );
}

function DemoRouteOptions({ data }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Route Optimization</div>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>{data.shipment.origin} → {data.shipment.dest} · {data.shipment.weight} · {data.shipment.value}</div>
      {data.options.sort((a, b) => b.score - a.score).map((o, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 12, border: i === 0 ? "1px solid #22C55E44" : "1px solid #1E293B", marginBottom: 8, position: "relative" }}>
          {i === 0 && <span style={{ position: "absolute", top: -8, right: 12, background: "#22C55E", color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>OPTIMAL</span>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 14 }}>{o.mode}</span>
            <span style={{ color: "#3B82F6", fontWeight: 800 }}>Score: {o.score}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Cost</div>
              <div style={{ fontSize: 14, color: "#E2E8F0", fontWeight: 700 }}>${o.cost.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Transit</div>
              <div style={{ fontSize: 14, color: "#E2E8F0", fontWeight: 700 }}>{o.transit} days</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748B" }}>CO₂ (tonnes)</div>
              <div style={{ fontSize: 14, color: "#E2E8F0", fontWeight: 700 }}>{o.carbon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DemoCapacityGaps({ data }) {
  const maxVal = Math.max(...data.weeks.map(w => Math.max(w.demand, w.capacity)));
  return (
    <div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Capacity vs. Demand Forecast (Transport Units)</div>
      <div style={{ display: "flex", gap: 6 }}>
        {data.weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 120, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2, alignItems: "center" }}>
              <div style={{ width: 18, height: `${(w.demand / maxVal) * 100}%`, background: w.gap > 0 ? "#EF4444" : "#3B82F6", borderRadius: "4px 4px 0 0", position: "relative" }}>
                <span style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#E2E8F0", whiteSpace: "nowrap" }}>{w.demand}</span>
              </div>
              <div style={{ width: 18, height: `${(w.capacity / maxVal) * 100}%`, background: "#1E293B", borderRadius: "4px 4px 0 0", border: "1px solid #334155" }} />
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{w.week}</div>
            {w.gap > 0 && <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 700 }}>-{w.gap}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, background: "#3B82F6", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#94A3B8" }}>Demand</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, background: "#1E293B", border: "1px solid #334155", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#94A3B8" }}>Capacity</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, background: "#EF4444", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#94A3B8" }}>Overflow</span></div>
      </div>
    </div>
  );
}

function DemoMatchingStats({ data }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Total Invoices", value: data.stats.total.toLocaleString(), color: "#E2E8F0" },
          { label: "Auto-Approved", value: data.stats.autoApproved.toLocaleString(), color: "#22C55E" },
          { label: "Exceptions", value: data.stats.exceptions.toLocaleString(), color: "#F59E0B" },
          { label: "Match Rate", value: `${data.stats.matchRate}%`, color: "#3B82F6" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 10, textAlign: "center", border: "1px solid #1E293B" }}>
            <div style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Recent Exceptions</div>
      {data.exceptions.map((e, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 6, padding: 10, border: "1px solid #1E293B", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#E2E8F0" }}>{e.invoice} ↔ {e.po}</div>
            <div style={{ fontSize: 11, color: "#F59E0B" }}>{e.type}: {e.amount}</div>
          </div>
          <span style={{ fontSize: 11, color: "#94A3B8", background: "#1E293B", padding: "2px 8px", borderRadius: 4 }}>{e.status}</span>
        </div>
      ))}
    </div>
  );
}

function DemoSpendOverview({ data }) {
  const maxSpend = Math.max(...data.categories.map(c => Math.max(c.actual, c.budget)));
  return (
    <div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Category Spend vs. Budget (YTD)</div>
      {data.categories.map((c, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
            <span style={{ color: "#E2E8F0", fontWeight: 600 }}>{c.name}</span>
            <span style={{ color: c.variance > 0 ? "#EF4444" : "#22C55E", fontWeight: 700 }}>
              {c.variance > 0 ? "+" : ""}{c.variance}%
            </span>
          </div>
          <div style={{ position: "relative", height: 14, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ position: "absolute", height: "100%", width: `${(c.budget / maxSpend) * 100}%`, background: "#334155", borderRadius: 4 }} />
            <div style={{ position: "absolute", height: "100%", width: `${(c.actual / maxSpend) * 100}%`, background: c.variance > 0 ? "#EF444488" : "#22C55E88", borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748B", marginTop: 2 }}>
            <span>Actual: ${(c.actual / 1e6).toFixed(1)}M</span>
            <span>Budget: ${(c.budget / 1e6).toFixed(1)}M</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DemoCommsPreview({ data }) {
  return (
    <div>
      {data.messages.map((m, i) => (
        <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 14, border: "1px solid #1E293B", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, background: "#1E293B", color: "#94A3B8", padding: "2px 10px", borderRadius: 4, fontWeight: 600 }}>{m.audience}</span>
            <span style={{ fontSize: 10, color: "#64748B" }}>Auto-generated</span>
          </div>
          <div style={{ fontSize: 13, color: "#F8FAFC", fontWeight: 700, marginBottom: 6 }}>{m.subject}</div>
          <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{m.preview}</div>
        </div>
      ))}
    </div>
  );
}

function renderDemo(agent) {
  const d = agent.demoData;
  switch (d.type) {
    case "risk_dashboard": return <DemoRiskDashboard data={d} />;
    case "rfq_comparison": return <DemoRfqComparison data={d} />;
    case "performance_cards": return <DemoPerformanceCards data={d} />;
    case "market_rates": return <DemoMarketRates data={d} />;
    case "clause_analysis": return <DemoClauseAnalysis data={d} />;
    case "compliance_check": return <DemoComplianceCheck data={d} />;
    case "doc_status": return <DemoDocStatus data={d} />;
    case "spend_audit": return <DemoSpendAudit data={d} />;
    case "eta_predictions": return <DemoEtaPredictions data={d} />;
    case "route_options": return <DemoRouteOptions data={d} />;
    case "capacity_gaps": return <DemoCapacityGaps data={d} />;
    case "matching_stats": return <DemoMatchingStats data={d} />;
    case "spend_overview": return <DemoSpendOverview data={d} />;
    case "comms_preview": return <DemoCommsPreview data={d} />;
    default: return null;
  }
}

// — Agent Detail View —

function AgentDetail({ agent, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const pillar = PILLARS[agent.pillar];
  const tabs = ["overview", "architecture", "data sources", "live demo"];

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", padding: "20px 28px", borderBottom: "1px solid #334155" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to Command Center
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 36 }}>{agent.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ color: pillar.color, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{pillar.label}</span>
              <span style={{ background: "#1E293B", padding: "2px 10px", borderRadius: 4, fontSize: 11, color: "#94A3B8" }}>{agent.complexity}</span>
              <span style={{ background: "#1E293B", padding: "2px 10px", borderRadius: 4, fontSize: 11, color: "#94A3B8" }}>{agent.timeline}</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>Agent {agent.num}: {agent.name}</h1>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "4px 0 0", fontStyle: "italic" }}>{agent.tagline}</p>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "8px 16px", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize",
              background: activeTab === t ? "#020617" : "transparent",
              color: activeTab === t ? "#F8FAFC" : "#64748B",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 28 }}>
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Purpose</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" }}>{agent.purpose}</p>
              <h3 style={{ fontSize: 15, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginTop: 24, marginBottom: 10 }}>ROI & Business Impact</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" }}>{agent.roi}</p>
            </div>
            <div>
              <h3 style={{ fontSize: 15, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Key Outputs</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {agent.outputs.map((o, i) => (
                  <div key={i} style={{ background: "#0F172A", borderRadius: 6, padding: "10px 14px", border: "1px solid #1E293B", fontSize: 13, color: "#E2E8F0", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: pillar.color }}>●</span> {o}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "architecture" && (
          <div>
            <h3 style={{ fontSize: 15, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Processing Pipeline</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {agent.architecture.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "stretch", gap: 16 }}>
                  {/* Timeline */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#FFF", flexShrink: 0 }}>{i + 1}</div>
                    {i < agent.architecture.length - 1 && <div style={{ width: 2, flex: 1, background: `linear-gradient(${s.color}, ${agent.architecture[i + 1].color})`, minHeight: 20 }} />}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: 20 }}>
                    <div style={{ background: "#0F172A", borderRadius: 8, padding: 16, border: "1px solid #1E293B", borderLeft: `3px solid ${s.color}` }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: s.color, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.step}</div>
                      <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.6 }}>{s.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "data sources" && (
          <div>
            <h3 style={{ fontSize: 15, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Required Data Sources</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {agent.dataSources.map((ds, i) => (
                <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: 14, border: "1px solid #1E293B" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#F8FAFC", fontWeight: 600 }}>{ds.name}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, background: ds.type === "internal" ? "#1E3A5F" : "#3B1F2B", color: ds.type === "internal" ? "#60A5FA" : "#F472B6" }}>
                      {ds.type.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>Refresh: {ds.refresh}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "live demo" && (
          <div>
            <h3 style={{ fontSize: 15, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Simulated Output</h3>
            <div style={{ background: "#0F172A55", borderRadius: 12, padding: 20, border: "1px solid #1E293B" }}>
              {renderDemo(agent)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// — Main Dashboard —

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState(null);

  if (selectedAgent) {
    return <AgentDetail agent={selectedAgent} onBack={() => setSelectedAgent(null)} />;
  }

  const filteredAgents = filter === "all" ? AGENTS : AGENTS.filter(a => a.pillar === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#E2E8F0", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #0C1222 50%, #1a0e2e 100%)", padding: "40px 28px 28px", borderBottom: "1px solid #1E293B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E88" }} />
          <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>System Online</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F8FAFC", margin: "0 0 4px", letterSpacing: -0.5 }}>
          Procurement AI Command Center
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
          Motorola Solutions — 14 intelligent agents for logistics procurement &amp; trade operations
        </p>

        {/* Pillar Filter */}
        <div style={{ display: "flex", gap: 6, marginTop: 20, flexWrap: "wrap" }}>
          {[{ key: "all", label: "All Agents", color: "#94A3B8" }, ...Object.entries(PILLARS).map(([k, v]) => ({ key: k, label: v.label, color: v.color }))].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: filter === f.key ? f.color + "22" : "transparent",
              borderColor: filter === f.key ? f.color : "#334155",
              color: filter === f.key ? f.color : "#64748B",
            }}>{f.label}</button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 20 }}>
          {[
            { label: "Total Agents", value: "14", color: "#F8FAFC" },
            { label: "Quick Wins (<8 wks)", value: "3", color: "#22C55E" },
            { label: "High Complexity", value: "3", color: "#F59E0B" },
            { label: "Est. Total ROI", value: "15-25%", color: "#3B82F6" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#0F172A", borderRadius: 8, padding: "10px 14px", border: "1px solid #1E293B" }}>
              <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div style={{ padding: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filteredAgents.map(agent => {
            const pillar = PILLARS[agent.pillar];
            const isHovered = hoveredId === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                onMouseEnter={() => setHoveredId(agent.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: isHovered ? "#1E293B" : "#0F172A",
                  borderRadius: 10,
                  padding: 18,
                  cursor: "pointer",
                  border: `1px solid ${isHovered ? pillar.color + "66" : "#1E293B"}`,
                  transition: "all 0.2s ease",
                  transform: isHovered ? "translateY(-2px)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{agent.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: pillar.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{agent.num}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>{agent.name}</div>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5, margin: "0 0 12px" }}>{agent.tagline}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: pillar.color + "22", color: pillar.color, fontWeight: 600 }}>{pillar.label.split(" ")[0]}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#1E293B", color: "#94A3B8" }}>{agent.timeline}</span>
                  </div>
                  <span style={{ fontSize: 12, color: pillar.color, fontWeight: 600 }}>Explore →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
