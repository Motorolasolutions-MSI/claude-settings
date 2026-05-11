import { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis,
  ComposedChart
} from 'recharts';
import {
  AlertTriangle, X, Target, DollarSign, FileText, Shield, Zap, Leaf, Award,
  Calendar, Clock, TrendingUp, TrendingDown, Upload, Plane, Ship, Truck, Globe,
  CheckCircle, BookOpen, ArrowRight, Layers, Calculator, Info, ExternalLink,
  Copy, Check, Activity, Bell, Search, Filter, Download, BarChart3,
  Map, Route, Wind, Award as AwardIcon, AlertCircle, Star, Sparkles, Gauge,
  PackageCheck, Receipt, Clock4, ThumbsUp, ThumbsDown, Building2
} from 'lucide-react';

// ===================== CONSTANTS & DATA =====================

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
const CARRIER_COLORS = { FedEx: '#4d148c', DHL: '#fc0', DSV: '#003087', Polaris: '#dc2626', UPS: '#7c4a03', 'K+N': '#005a9e', Maersk: '#42b0d5' };

const carrierAgreements = [
  { id: 'fedex-dom', carrier: 'FedEx', mode: 'Parcel', region: 'Domestic', expires: '2026-09-30', services: [
    { service: 'Ground', transitDays: '1-5', baseRate: 8.50, perLb: 0.45, minCharge: 9.50, dimFactor: 166, fuelPct: 12.5 },
    { service: 'Express', transitDays: '1-2', baseRate: 24.00, perLb: 1.20, minCharge: 28.00, dimFactor: 166, fuelPct: 14.0 },
    { service: 'Priority Overnight', transitDays: '1', baseRate: 45.00, perLb: 2.50, minCharge: 52.00, dimFactor: 166, fuelPct: 14.0 },
  ]},
  { id: 'fedex-intl', carrier: 'FedEx', mode: 'Air', region: 'International', expires: '2026-03-15', services: [
    { service: 'International Economy', transitDays: '4-6', baseRate: 85.00, perLb: 4.25, minCharge: 95.00, dimFactor: 139, fuelPct: 16.0 },
    { service: 'International Priority', transitDays: '1-3', baseRate: 125.00, perLb: 6.50, minCharge: 145.00, dimFactor: 139, fuelPct: 16.0 },
  ]},
  { id: 'dhl-air', carrier: 'DHL', mode: 'Air', region: 'International', expires: '2027-01-31', services: [
    { service: 'Express Worldwide', transitDays: '2-4', baseRate: 95.00, perLb: 5.00, minCharge: 110.00, dimFactor: 139, fuelPct: 15.5 },
    { service: 'Express 9:00', transitDays: '1-2', baseRate: 175.00, perLb: 8.50, minCharge: 195.00, dimFactor: 139, fuelPct: 15.5 },
  ]},
  { id: 'dsv-ocean', carrier: 'DSV', mode: 'Ocean', region: 'International', expires: '2026-12-31', services: [
    { service: 'FCL Standard', transitDays: '25-35', baseRate: 2500.00, perCBM: 45.00, minCharge: 2800.00, fuelPct: 8.0 },
    { service: 'LCL Consolidation', transitDays: '30-45', baseRate: 350.00, perCBM: 65.00, minCharge: 450.00, fuelPct: 8.0 },
  ]},
  { id: 'polaris-ltl', carrier: 'Polaris', mode: 'LTL', region: 'Domestic', expires: '2026-06-30', services: [
    { service: 'Standard LTL', transitDays: '3-7', baseRate: 125.00, perCWT: 8.50, minCharge: 185.00, dimFactor: 194, fuelPct: 28.0 },
    { service: 'Expedited LTL', transitDays: '2-4', baseRate: 225.00, perCWT: 12.50, minCharge: 285.00, dimFactor: 194, fuelPct: 28.0 },
  ]},
  { id: 'ups-parcel', carrier: 'UPS', mode: 'Parcel', region: 'Domestic', expires: '2026-11-15', services: [
    { service: 'Ground', transitDays: '1-5', baseRate: 8.75, perLb: 0.48, minCharge: 9.75, dimFactor: 166, fuelPct: 12.5 },
    { service: '2nd Day Air', transitDays: '2', baseRate: 28.00, perLb: 1.35, minCharge: 32.00, dimFactor: 166, fuelPct: 14.0 },
    { service: 'Next Day Air', transitDays: '1', baseRate: 48.00, perLb: 2.65, minCharge: 55.00, dimFactor: 166, fuelPct: 14.0 },
  ]},
];

const incoterms = [
  { code: 'EXW', name: 'Ex Works', desc: 'Seller makes goods available at their premises', buyerRisk: 'Maximum', sellerRisk: 'Minimum', modes: 'All' },
  { code: 'FCA', name: 'Free Carrier', desc: 'Seller delivers to carrier nominated by buyer', buyerRisk: 'High', sellerRisk: 'Low', modes: 'All' },
  { code: 'FAS', name: 'Free Alongside Ship', desc: 'Seller delivers alongside vessel', buyerRisk: 'High', sellerRisk: 'Low', modes: 'Sea' },
  { code: 'FOB', name: 'Free On Board', desc: 'Seller delivers on board vessel', buyerRisk: 'Medium-High', sellerRisk: 'Medium-Low', modes: 'Sea' },
  { code: 'CFR', name: 'Cost and Freight', desc: 'Seller pays freight to destination port', buyerRisk: 'Medium', sellerRisk: 'Medium', modes: 'Sea' },
  { code: 'CIF', name: 'Cost, Insurance, Freight', desc: 'Seller pays freight and insurance', buyerRisk: 'Medium-Low', sellerRisk: 'Medium-High', modes: 'Sea' },
  { code: 'CPT', name: 'Carriage Paid To', desc: 'Seller pays carriage to destination', buyerRisk: 'Medium', sellerRisk: 'Medium', modes: 'All' },
  { code: 'CIP', name: 'Carriage & Insurance Paid', desc: 'Seller pays carriage and insurance', buyerRisk: 'Medium-Low', sellerRisk: 'Medium-High', modes: 'All' },
  { code: 'DAP', name: 'Delivered at Place', desc: 'Seller delivers to destination, unloaded', buyerRisk: 'Low', sellerRisk: 'High', modes: 'All' },
  { code: 'DDP', name: 'Delivered Duty Paid', desc: 'Seller delivers cleared for import', buyerRisk: 'Minimum', sellerRisk: 'Maximum', modes: 'All' },
];

const sopLibrary = [
  { id: 'dom-parcel', title: 'Domestic Parcel Shipment SOP', mode: 'Parcel', steps: ['Access TMS portal', 'Create shipment request', 'Enter ship-to address', 'Add package dimensions', 'Select service level', 'Generate label', 'Schedule pickup or drop-off', 'Track shipment'], doc: 'SOP-LOG-001' },
  { id: 'intl-air', title: 'International Air Freight SOP', mode: 'Air', steps: ['Verify export compliance', 'Prepare commercial invoice', 'Complete EEI/AES filing if >$2,500', 'Book with carrier', 'Arrange pickup', 'Provide docs to forwarder', 'Track and confirm delivery', 'Archive documentation'], doc: 'SOP-LOG-002' },
  { id: 'ocean-fcl', title: 'Ocean FCL Shipment SOP', mode: 'Ocean', steps: ['Request booking with carrier/forwarder', 'Confirm container type', 'Arrange drayage to port', 'Prepare Bill of Lading', 'Complete customs documentation', 'Track vessel', 'Arrange destination clearance', 'Coordinate final delivery'], doc: 'SOP-LOG-003' },
  { id: 'ltl-domestic', title: 'Domestic LTL Freight SOP', mode: 'LTL', steps: ['Create BOL with NMFC codes', 'Determine freight class', 'Request quote if needed', 'Schedule pickup', 'Palletize and label freight', 'Obtain PRO number', 'Track shipment', 'Confirm POD'], doc: 'SOP-LOG-004' },
];

const impactData = {
  annualSavings: 12.8,
  costAvoidance: 4.2,
  processEfficiency: 35,
  cycleTimeReduction: 42,
  qualityImprovement: 28,
  riskReduction: 45,
  timeline: [
    { q: 'Q1 2025', savings: 1.8, cumulative: 1.8, initiatives: 4 },
    { q: 'Q2 2025', savings: 2.4, cumulative: 4.2, initiatives: 6 },
    { q: 'Q3 2025', savings: 2.9, cumulative: 7.1, initiatives: 8 },
    { q: 'Q4 2025', savings: 3.2, cumulative: 10.3, initiatives: 12 },
    { q: 'Q1 2026', savings: 2.5, cumulative: 12.8, initiatives: 15 },
    { q: 'Q2 2026', savings: 3.1, cumulative: 15.9, initiatives: 18, projected: true },
    { q: 'Q3 2026', savings: 3.5, cumulative: 19.4, initiatives: 22, projected: true },
    { q: 'Q4 2026', savings: 4.0, cumulative: 23.4, initiatives: 25, projected: true },
  ],
  byCategory: [
    { name: 'Strategic Sourcing', savings: 3.2, projects: 10, status: 'On Track' },
    { name: 'Pricing & Rates', savings: 4.1, projects: 10, status: 'Exceeding' },
    { name: 'Contracts', savings: 1.8, projects: 8, status: 'On Track' },
    { name: 'Supplier Mgmt', savings: 1.5, projects: 8, status: 'On Track' },
    { name: 'Technology', savings: 1.2, projects: 8, status: 'At Risk' },
    { name: 'Analytics', savings: 0.6, projects: 5, status: 'On Track' },
    { name: 'Risk Mgmt', savings: 0.2, projects: 6, status: 'On Track' },
    { name: 'Sustainability', savings: 0.2, projects: 5, status: 'On Track' },
  ],
};

const projectTimeline = [
  { id: 1, name: 'Heavy Weight Air RFP', start: '2026-01', end: '2026-04', status: 'In Progress', impact: '$2.5M', owner: 'Sam Bloomberg', category: 'Sourcing', progress: 65 },
  { id: 2, name: 'FedEx Contract Renewal', start: '2025-10', end: '2026-03', status: 'In Progress', impact: '$1.8M', owner: 'Sam Bloomberg', category: 'Contracts', progress: 80 },
  { id: 3, name: 'Project MAIA (AI/ML)', start: '2026-01', end: '2026-09', status: 'In Progress', impact: '$1.5M', owner: 'Sam Bloomberg', category: 'Technology', progress: 35 },
  { id: 4, name: 'DHL RFID Implementation', start: '2026-02', end: '2026-10', status: 'Planned', impact: '$800K', owner: 'Sam Bloomberg', category: 'Technology', progress: 15 },
  { id: 5, name: 'DSV Transition', start: '2026-01', end: '2026-06', status: 'In Progress', impact: '$1.2M', owner: 'Arek Marczyk', category: 'Sourcing', progress: 55 },
  { id: 6, name: 'Accessorial Optimization', start: '2025-08', end: '2026-05', status: 'In Progress', impact: '$2.1M', owner: 'Sam Bloomberg', category: 'Pricing', progress: 75 },
  { id: 7, name: 'DIM Factor Negotiation', start: '2025-12', end: '2026-06', status: 'In Progress', impact: '$2.2M', owner: 'Sam Bloomberg', category: 'Pricing', progress: 50 },
  { id: 8, name: 'Control Tower', start: '2026-05', end: '2027-03', status: 'Planned', impact: '$1.0M', owner: 'Ken Bradshaw', category: 'Technology', progress: 5 },
  { id: 9, name: 'Mode Optimization', start: '2025-06', end: '2026-06', status: 'In Progress', impact: '$4.0M', owner: 'Arek Marczyk', category: 'Sustainability', progress: 70 },
  { id: 10, name: 'Supplier Consolidation', start: '2025-09', end: '2026-06', status: 'In Progress', impact: '$600K', owner: 'Sam Bloomberg', category: 'Sourcing', progress: 60 },
];

// ===================== CARRIER SCORECARD DATA =====================
const carrierScorecard = [
  { carrier: 'FedEx', otd: 96.4, billingAccuracy: 98.2, claimsRate: 0.18, invoiceDispute: 2.1, ytdSpend: 28.4, shipments: 142500, csat: 4.4, trend: 'up', riskFlag: 'green',
    sparkOTD: [94.1, 94.8, 95.2, 95.6, 95.8, 96.1, 96.3, 96.4, 96.5, 96.4, 96.4, 96.4],
    sparkSpend: [2.1, 2.3, 2.4, 2.5, 2.4, 2.6, 2.7, 2.5, 2.4, 2.3, 2.4, 2.4] },
  { carrier: 'DHL', otd: 94.8, billingAccuracy: 96.5, claimsRate: 0.22, invoiceDispute: 3.4, ytdSpend: 18.6, shipments: 68200, csat: 4.2, trend: 'up', riskFlag: 'green',
    sparkOTD: [92.5, 93.1, 93.4, 93.8, 94.2, 94.5, 94.6, 94.7, 94.8, 94.8, 94.9, 94.8],
    sparkSpend: [1.4, 1.5, 1.5, 1.6, 1.6, 1.5, 1.6, 1.5, 1.5, 1.6, 1.5, 1.6] },
  { carrier: 'DSV', otd: 88.2, billingAccuracy: 94.1, claimsRate: 0.31, invoiceDispute: 5.8, ytdSpend: 14.2, shipments: 8400, csat: 3.8, trend: 'flat', riskFlag: 'yellow',
    sparkOTD: [86.4, 86.8, 87.2, 87.5, 87.8, 88.0, 88.1, 88.2, 88.2, 88.3, 88.2, 88.2],
    sparkSpend: [1.1, 1.2, 1.2, 1.2, 1.2, 1.1, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2] },
  { carrier: 'Polaris', otd: 92.1, billingAccuracy: 93.8, claimsRate: 0.28, invoiceDispute: 4.2, ytdSpend: 8.9, shipments: 24100, csat: 4.0, trend: 'down', riskFlag: 'yellow',
    sparkOTD: [93.4, 93.1, 92.8, 92.5, 92.4, 92.2, 92.1, 92.0, 92.1, 92.1, 92.0, 92.1],
    sparkSpend: [0.7, 0.8, 0.7, 0.7, 0.8, 0.7, 0.8, 0.7, 0.7, 0.7, 0.8, 0.7] },
  { carrier: 'UPS', otd: 95.7, billingAccuracy: 97.4, claimsRate: 0.19, invoiceDispute: 2.6, ytdSpend: 6.4, shipments: 38900, csat: 4.3, trend: 'up', riskFlag: 'green',
    sparkOTD: [94.2, 94.5, 94.8, 95.1, 95.3, 95.5, 95.6, 95.7, 95.7, 95.8, 95.7, 95.7],
    sparkSpend: [0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.6, 0.5, 0.5, 0.6, 0.5, 0.5] },
  { carrier: 'K+N', otd: 86.4, billingAccuracy: 91.2, claimsRate: 0.42, invoiceDispute: 7.1, ytdSpend: 4.8, shipments: 3200, csat: 3.5, trend: 'down', riskFlag: 'red',
    sparkOTD: [88.5, 88.1, 87.8, 87.4, 87.0, 86.8, 86.6, 86.5, 86.4, 86.3, 86.4, 86.4],
    sparkSpend: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4] },
];

const monthLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

// ===================== SPEND ANALYTICS DATA =====================
const spendAnalytics = {
  totalYTD: 81.3,
  yoyChange: 8.4,
  byMode: [
    { mode: 'Parcel', spend: 34.8, pct: 42.8, shipments: 181400 },
    { mode: 'Air Freight', spend: 22.4, pct: 27.6, shipments: 8200 },
    { mode: 'Ocean', spend: 14.2, pct: 17.5, shipments: 1100 },
    { mode: 'LTL/FTL', spend: 8.9, pct: 10.9, shipments: 24100 },
    { mode: 'Other', spend: 1.0, pct: 1.2, shipments: 5400 },
  ],
  byRegion: [
    { region: 'North America', spend: 38.4, pct: 47.2 },
    { region: 'EMEA', spend: 24.1, pct: 29.7 },
    { region: 'APAC', spend: 14.8, pct: 18.2 },
    { region: 'LATAM', spend: 4.0, pct: 4.9 },
  ],
  monthly: [
    { month: 'Feb', spend: 6.2, baseline: 5.8, market: 6.0 },
    { month: 'Mar', spend: 6.8, baseline: 6.2, market: 6.5 },
    { month: 'Apr', spend: 6.5, baseline: 6.1, market: 6.3 },
    { month: 'May', spend: 7.1, baseline: 6.4, market: 6.8 },
    { month: 'Jun', spend: 7.4, baseline: 6.6, market: 7.0 },
    { month: 'Jul', spend: 6.9, baseline: 6.5, market: 6.8 },
    { month: 'Aug', spend: 7.2, baseline: 6.7, market: 7.0 },
    { month: 'Sep', spend: 7.5, baseline: 6.8, market: 7.2 },
    { month: 'Oct', spend: 7.8, baseline: 7.0, market: 7.5 },
    { month: 'Nov', spend: 6.4, baseline: 6.5, market: 6.8 },
    { month: 'Dec', spend: 5.9, baseline: 6.2, market: 6.4 },
    { month: 'Jan', spend: 5.6, baseline: 6.0, market: 6.1 },
  ],
  topOpportunities: [
    { name: 'Mode shift: APAC Air -> Ocean', impact: 1.85, effort: 'Medium', timeline: 'Q2 2026', confidence: 92 },
    { name: 'DIM factor renegotiation (FedEx)', impact: 2.20, effort: 'Low', timeline: 'Q1 2026', confidence: 85 },
    { name: 'Accessorial audit recovery', impact: 0.95, effort: 'Low', timeline: 'Ongoing', confidence: 96 },
    { name: 'Consolidation: EU intra-region', impact: 0.74, effort: 'Medium', timeline: 'Q3 2026', confidence: 78 },
    { name: 'Carrier mix optimization (LATAM)', impact: 0.42, effort: 'High', timeline: 'Q3 2026', confidence: 70 },
  ],
};

// ===================== LANE INTELLIGENCE DATA =====================
const topLanes = [
  { id: 1, origin: 'Schaumburg, IL', dest: 'Munich, DE', mode: 'Air', spend: 4.8, shipments: 1240, avgWeight: 285, primary: 'FedEx', secondary: 'DHL', co2: 845, opportunity: 'Mode shift to Ocean: $620K', flag: 'high' },
  { id: 2, origin: 'Penang, MY', dest: 'Schaumburg, IL', mode: 'Air', spend: 4.2, shipments: 980, avgWeight: 412, primary: 'DHL', secondary: 'FedEx', co2: 1240, opportunity: 'Consolidation opportunity', flag: 'medium' },
  { id: 3, origin: 'Schaumburg, IL', dest: 'Plantation, FL', mode: 'Parcel', spend: 3.6, shipments: 18400, avgWeight: 12, primary: 'FedEx', secondary: 'UPS', co2: 285, opportunity: 'DIM optimization', flag: 'medium' },
  { id: 4, origin: 'Penang, MY', dest: 'Munich, DE', mode: 'Ocean', spend: 2.9, shipments: 145, avgWeight: 1840, primary: 'DSV', secondary: 'K+N', co2: 124, opportunity: 'Service level upgrade', flag: 'low' },
  { id: 5, origin: 'Schaumburg, IL', dest: 'Toronto, CA', mode: 'LTL', spend: 2.4, shipments: 3200, avgWeight: 624, primary: 'Polaris', secondary: '-', co2: 412, opportunity: 'Carrier diversification', flag: 'medium' },
  { id: 6, origin: 'Munich, DE', dest: 'Penang, MY', mode: 'Air', spend: 2.1, shipments: 540, avgWeight: 198, primary: 'DHL', secondary: 'FedEx', co2: 580, opportunity: 'Sea-Air optimization', flag: 'medium' },
  { id: 7, origin: 'Schaumburg, IL', dest: 'Mexico City, MX', mode: 'Parcel', spend: 1.8, shipments: 8400, avgWeight: 18, primary: 'FedEx', secondary: 'UPS', co2: 142, opportunity: 'Volume rebate trigger', flag: 'low' },
  { id: 8, origin: 'Tel Aviv, IL', dest: 'Schaumburg, IL', mode: 'Air', spend: 1.6, shipments: 280, avgWeight: 240, primary: 'DHL', secondary: '-', co2: 415, opportunity: 'Geopolitical risk: monitor', flag: 'high' },
];

// ===================== ALERTS DATA =====================
const alerts = [
  { id: 1, type: 'critical', title: 'FedEx Intl contract expires in 35 days', detail: 'Renewal negotiation pending - $18.4M annual exposure', time: '2h ago' },
  { id: 2, type: 'warning', title: 'Spot rate spike: TPEB +18% WoW', detail: 'Trans-Pacific Eastbound - review committed volume', time: '5h ago' },
  { id: 3, type: 'info', title: 'K+N performance below SLA threshold', detail: 'OTD 86.4% vs 92% target - escalation triggered', time: '1d ago' },
  { id: 4, type: 'warning', title: 'Polaris LTL contract expires in 52 days', detail: 'Routing guide impact pending', time: '1d ago' },
];

const businessUnits = ['Corporate HQ', 'Video Security', 'Command Center', 'Land Mobile Radio', 'Services & Software', 'Manufacturing - Schaumburg', 'Manufacturing - Penang', 'Manufacturing - Germany', 'Field Services', 'R&D Labs'];
const commodityTypes = ['Finished Goods', 'Raw Materials', 'Components', 'Samples', 'Returns', 'Service Parts', 'Documents', 'Prototypes', 'Hazmat', 'High Value'];
const packagingTypes = ['Pallet', 'Carton', 'Crate', 'Envelope', 'Tube', 'Drum', 'Gaylord', 'Skid', 'Container'];

// ===================== HELPER COMPONENTS =====================

function Sparkline({ data, color = '#10b981', height = 28, width = 80 }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="2" fill={color} />
    </svg>
  );
}

function StatusDot({ flag }) {
  const colors = { green: 'bg-emerald-500', yellow: 'bg-amber-500', red: 'bg-rose-500' };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[flag] || 'bg-gray-400'} ring-2 ring-offset-1 ring-offset-gray-900 ring-current opacity-90`} />;
}

// ===================== MAIN COMPONENT =====================

export default function LogisticsHub() {
  const [activeTab, setActiveTab] = useState('impact');
  const [quoteStep, setQuoteStep] = useState(0);
  const [quoteData, setQuoteData] = useState({ bu: '', origin: '', dest: '', weight: '', dims: { l: '', w: '', h: '' }, qty: 1, commodity: '', packaging: '', value: '', urgency: '', incoterm: 'DAP', hazmat: false, liftgate: false, residential: false, appointment: false, insurance: false });
  const [quoteResult, setQuoteResult] = useState(null);
  const [agreements] = useState(carrierAgreements);
  const [showSOP, setShowSOP] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [copiedSOP, setCopiedSOP] = useState(false);
  const [timelineView, setTimelineView] = useState('gantt');
  const [alertsOpen, setAlertsOpen] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [spendView, setSpendView] = useState('mode');
  const [laneSort, setLaneSort] = useState('spend');
  const [laneFilter, setLaneFilter] = useState('all');

  const tabs = [
    { id: 'impact', label: 'Impact', icon: TrendingUp },
    { id: 'scorecard', label: 'Carrier Scorecard', icon: AwardIcon, badge: 'NEW' },
    { id: 'spend', label: 'Spend Analytics', icon: BarChart3, badge: 'NEW' },
    { id: 'lanes', label: 'Lane Intelligence', icon: Map, badge: 'NEW' },
    { id: 'timeline', label: 'Projects', icon: Calendar },
    { id: 'quote', label: 'Rate Quote', icon: Calculator },
    { id: 'agreements', label: 'CLM', icon: FileText },
    { id: 'sop', label: 'SOPs', icon: BookOpen },
  ];

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  const calculateQuote = useCallback(() => {
    const { weight, dims, qty, urgency, dest } = quoteData;
    const actualWeight = parseFloat(weight) * parseInt(qty || 1);
    const dimWeight = (parseFloat(dims.l) * parseFloat(dims.w) * parseFloat(dims.h) * parseInt(qty || 1)) / 139;
    const billableWeight = Math.max(actualWeight, dimWeight);

    const isInternational = ['china', 'germany', 'uk', 'mexico', 'canada', 'malaysia', 'singapore', 'penang', 'munich'].some(c => dest.toLowerCase().includes(c));
    const isHeavy = billableWeight > 150;

    let recommendations = [];

    if (isInternational && urgency === 'critical') {
      recommendations = [
        { carrier: 'DHL', service: 'Express 9:00', transit: '1-2 days', cost: 175 + (billableWeight * 8.50), confidence: 98, co2: billableWeight * 1.85 },
        { carrier: 'FedEx', service: 'International Priority', transit: '1-3 days', cost: 125 + (billableWeight * 6.50), confidence: 95, co2: billableWeight * 1.78 },
      ];
    } else if (isInternational && urgency === 'standard') {
      recommendations = [
        { carrier: 'FedEx', service: 'International Economy', transit: '4-6 days', cost: 85 + (billableWeight * 4.25), confidence: 96, co2: billableWeight * 1.62 },
        { carrier: 'DHL', service: 'Express Worldwide', transit: '2-4 days', cost: 95 + (billableWeight * 5.00), confidence: 94, co2: billableWeight * 1.71 },
      ];
    } else if (isInternational && urgency === 'economy') {
      recommendations = [
        { carrier: 'DSV', service: 'LCL Consolidation', transit: '30-45 days', cost: 350 + (billableWeight * 0.15), confidence: 92, co2: billableWeight * 0.18 },
        { carrier: 'FedEx', service: 'International Economy', transit: '4-6 days', cost: 85 + (billableWeight * 4.25), confidence: 90, co2: billableWeight * 1.62 },
      ];
    } else if (isHeavy) {
      recommendations = [
        { carrier: 'Polaris', service: 'Standard LTL', transit: '3-7 days', cost: 125 + (billableWeight * 0.085), confidence: 94, co2: billableWeight * 0.62 },
        { carrier: 'Polaris', service: 'Expedited LTL', transit: '2-4 days', cost: 225 + (billableWeight * 0.125), confidence: 92, co2: billableWeight * 0.68 },
      ];
    } else if (urgency === 'critical') {
      recommendations = [
        { carrier: 'FedEx', service: 'Priority Overnight', transit: '1 day', cost: 45 + (billableWeight * 2.50), confidence: 99, co2: billableWeight * 1.45 },
        { carrier: 'UPS', service: 'Next Day Air', transit: '1 day', cost: 48 + (billableWeight * 2.65), confidence: 97, co2: billableWeight * 1.42 },
      ];
    } else if (urgency === 'expedited') {
      recommendations = [
        { carrier: 'FedEx', service: 'Express', transit: '1-2 days', cost: 24 + (billableWeight * 1.20), confidence: 97, co2: billableWeight * 0.92 },
        { carrier: 'UPS', service: '2nd Day Air', transit: '2 days', cost: 28 + (billableWeight * 1.35), confidence: 95, co2: billableWeight * 0.95 },
      ];
    } else {
      recommendations = [
        { carrier: 'FedEx', service: 'Ground', transit: '1-5 days', cost: 8.50 + (billableWeight * 0.45), confidence: 98, co2: billableWeight * 0.42 },
        { carrier: 'UPS', service: 'Ground', transit: '1-5 days', cost: 8.75 + (billableWeight * 0.48), confidence: 96, co2: billableWeight * 0.44 },
      ];
    }

    const accessorials = [];
    if (quoteData.liftgate) accessorials.push({ name: 'Liftgate', cost: 75 });
    if (quoteData.residential) accessorials.push({ name: 'Residential Delivery', cost: 4.50 });
    if (quoteData.appointment) accessorials.push({ name: 'Appointment', cost: 35 });
    if (quoteData.insurance && parseFloat(quoteData.value) > 100) accessorials.push({ name: 'Declared Value', cost: parseFloat(quoteData.value) * 0.025 });

    const accessorialTotal = accessorials.reduce((sum, a) => sum + a.cost, 0);

    const cheapestContracted = Math.min(...recommendations.map(r => r.cost));
    const spotRate = cheapestContracted * (1 + (Math.random() * 0.18 + 0.05));
    const savingsVsSpot = spotRate - cheapestContracted;

    setQuoteResult({
      recommendations: recommendations.map(r => ({ ...r, cost: r.cost + accessorialTotal, baseCost: r.cost - accessorialTotal })),
      billableWeight: Math.round(billableWeight * 10) / 10,
      actualWeight,
      dimWeight: Math.round(dimWeight * 10) / 10,
      accessorials,
      accessorialTotal,
      sop: isInternational ? sopLibrary.find(s => s.mode === 'Air') : (isHeavy ? sopLibrary.find(s => s.mode === 'LTL') : sopLibrary.find(s => s.mode === 'Parcel')),
      incoterm: incoterms.find(i => i.code === quoteData.incoterm),
      spotRate: Math.round(spotRate * 100) / 100,
      savingsVsSpot: Math.round(savingsVsSpot * 100) / 100,
      savingsPct: Math.round((savingsVsSpot / spotRate) * 100),
    });
    setQuoteStep(4);
  }, [quoteData]);

  const resetQuote = () => { setQuoteStep(0); setQuoteResult(null); setQuoteData({ bu: '', origin: '', dest: '', weight: '', dims: { l: '', w: '', h: '' }, qty: 1, commodity: '', packaging: '', value: '', urgency: '', incoterm: 'DAP', hazmat: false, liftgate: false, residential: false, appointment: false, insurance: false }); };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const getMonthIndex = (dateStr) => { const [y, m] = dateStr.split('-'); return (parseInt(y) - 2025) * 12 + parseInt(m) - 1; };

  const totalImpact = impactData.byCategory.reduce((sum, c) => sum + c.savings, 0);
  const totalProjects = impactData.byCategory.reduce((sum, c) => sum + c.projects, 0);

  const filteredLanes = useMemo(() => {
    let result = [...topLanes];
    if (laneFilter !== 'all') result = result.filter(l => l.mode.toLowerCase() === laneFilter);
    if (laneSort === 'spend') result.sort((a, b) => b.spend - a.spend);
    if (laneSort === 'co2') result.sort((a, b) => b.co2 - a.co2);
    if (laneSort === 'volume') result.sort((a, b) => b.shipments - a.shipments);
    return result;
  }, [laneFilter, laneSort]);

  const daysUntil = (dateStr) => {
    const target = new Date(dateStr);
    const now = new Date('2026-05-09');
    return Math.round((target - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-sm font-sans" style={{ fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif' }}>
      {/* ===== HEADER ===== */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
        </div>
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Award size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">MSI Logistics Operations Hub</h1>
                <p className="text-blue-200/80 text-[11px] tracking-wide">Procurement Excellence • CLM • Rate Intelligence • Performance</p>
              </div>
              <span className="ml-2 px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-md text-[10px] font-semibold text-blue-200">v8.0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur">
                <Search size={14} className="text-blue-200/60" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search carriers, lanes, projects..." className="bg-transparent outline-none text-xs text-white placeholder:text-blue-200/40 w-48" />
              </div>
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <Download size={14} className="text-blue-100" />
              </button>
              <div className="hidden lg:flex items-center gap-3 ml-2">
                <div className="text-right bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                  <p className="text-lg font-bold text-emerald-300 leading-tight">${totalImpact.toFixed(1)}M</p>
                  <p className="text-[10px] text-emerald-200/70 leading-tight">Annual Impact</p>
                </div>
                <div className="text-right bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5">
                  <p className="text-lg font-bold text-blue-300 leading-tight">{totalProjects}</p>
                  <p className="text-[10px] text-blue-200/70 leading-tight">Projects</p>
                </div>
                <div className="text-right bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5">
                  <p className="text-lg font-bold text-purple-300 leading-tight">${spendAnalytics.totalYTD}M</p>
                  <p className="text-[10px] text-purple-200/70 leading-tight">YTD Spend</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ALERTS BANNER ===== */}
      {alertsOpen && visibleAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 to-rose-950/40 border-y border-amber-500/20 px-4 py-2">
          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-2 text-amber-300 flex-shrink-0">
              <Bell size={14} className="animate-pulse" />
              <span className="text-xs font-semibold">{visibleAlerts.length} active alert{visibleAlerts.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              {visibleAlerts.map(a => (
                <div key={a.id} className={`flex items-center gap-2 px-3 py-1 rounded-lg flex-shrink-0 border ${
                  a.type === 'critical' ? 'bg-rose-500/15 border-rose-500/30 text-rose-200' :
                  a.type === 'warning' ? 'bg-amber-500/15 border-amber-500/30 text-amber-200' :
                  'bg-blue-500/15 border-blue-500/30 text-blue-200'
                }`}>
                  {a.type === 'critical' ? <AlertCircle size={12} /> : <AlertTriangle size={12} />}
                  <span className="text-xs font-medium">{a.title}</span>
                  <span className="text-[10px] opacity-60">• {a.time}</span>
                  <button onClick={() => setDismissedAlerts([...dismissedAlerts, a.id])} className="opacity-60 hover:opacity-100">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setAlertsOpen(false)} className="text-amber-300/60 hover:text-amber-300 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ===== TABS ===== */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-all relative ${activeTab === t.id ? 'border-blue-400 text-blue-300 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>
            <t.icon size={15} />
            <span>{t.label}</span>
            {t.badge && <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[8px] rounded font-bold border border-emerald-500/30">{t.badge}</span>}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* ===================== IMPACT TAB ===================== */}
        {activeTab === 'impact' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Annual Savings', value: `$${impactData.annualSavings}M`, color: 'from-emerald-500 to-teal-600', icon: DollarSign, trend: '+18%', spark: [8.2, 9.1, 10.3, 11.2, 11.8, 12.4, 12.6, 12.8] },
                { label: 'Cost Avoidance', value: `$${impactData.costAvoidance}M`, color: 'from-blue-500 to-cyan-600', icon: Shield, trend: '+12%', spark: [2.8, 3.1, 3.4, 3.6, 3.8, 4.0, 4.1, 4.2] },
                { label: 'Process Efficiency', value: `+${impactData.processEfficiency}%`, color: 'from-purple-500 to-violet-600', icon: Zap, trend: '+5pp', spark: [22, 25, 28, 30, 32, 33, 34, 35] },
                { label: 'Cycle Time', value: `-${impactData.cycleTimeReduction}%`, color: 'from-orange-500 to-amber-600', icon: Clock, trend: '-8pp', spark: [28, 32, 35, 38, 40, 41, 42, 42] },
                { label: 'Quality', value: `+${impactData.qualityImprovement}%`, color: 'from-pink-500 to-rose-600', icon: CheckCircle, trend: '+3pp', spark: [18, 20, 22, 24, 25, 26, 27, 28] },
                { label: 'Risk Reduction', value: `-${impactData.riskReduction}%`, color: 'from-teal-500 to-cyan-600', icon: Shield, trend: '-12pp', spark: [25, 30, 34, 38, 41, 43, 44, 45] },
              ].map(kpi => (
                <div key={kpi.label} className={`relative bg-gradient-to-br ${kpi.color} rounded-xl p-3 text-white shadow-lg overflow-hidden group`}>
                  <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={kpi.spark} color="rgba(255,255,255,0.7)" width={50} height={20} />
                  </div>
                  <kpi.icon size={18} className="mb-1.5 opacity-80" />
                  <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px] opacity-80">{kpi.label}</p>
                    <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-semibold">{kpi.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><TrendingUp size={18} className="text-emerald-400" />Value Realization Timeline</h3>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-3 bg-emerald-500 rounded" />Realized</span>
                  <span className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-3 bg-blue-500 rounded opacity-50" />Projected</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={impactData.timeline}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="q" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v) => [`$${v}M`]} />
                  <Area type="monotone" dataKey="cumulative" stroke="#10b981" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={3} name="Cumulative Savings" />
                  <Bar dataKey="savings" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Quarterly Savings" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Layers size={18} className="text-blue-400" />Impact by Category</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={impactData.byCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}M`} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="savings" radius={[0, 4, 4, 0]}>
                      {impactData.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Target size={18} className="text-purple-400" />Top Savings Opportunities</h3>
                <div className="space-y-2">
                  {spendAnalytics.topOpportunities.slice(0, 5).map((opp, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{opp.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${opp.effort === 'Low' ? 'bg-emerald-500/15 text-emerald-300' : opp.effort === 'Medium' ? 'bg-amber-500/15 text-amber-300' : 'bg-rose-500/15 text-rose-300'}`}>{opp.effort}</span>
                            <span className="text-[10px] text-slate-500">{opp.timeline}</span>
                            <span className="text-[10px] text-slate-500">• {opp.confidence}% conf</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-emerald-400 font-bold text-sm">${opp.impact}M</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {impactData.byCategory.map((cat, i) => (
                <div key={cat.name} className="bg-slate-900 rounded-xl p-3 border border-slate-800 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-slate-400 truncate">{cat.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${cat.status === 'Exceeding' ? 'bg-emerald-500/15 text-emerald-300' : cat.status === 'At Risk' ? 'bg-rose-500/15 text-rose-300' : 'bg-blue-500/15 text-blue-300'}`}>{cat.status}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">${cat.savings}M</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-500">{cat.projects} projects</span>
                    <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(cat.savings / 4.5) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== CARRIER SCORECARD TAB ===================== */}
        {activeTab === 'scorecard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><AwardIcon size={20} className="text-amber-400" />Carrier Performance Scorecard</h3>
                <p className="text-xs text-slate-400 mt-1">YTD performance vs SLA • QBR-ready metrics</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg text-xs hover:bg-slate-700 flex items-center gap-1.5">
                  <Download size={12} /> Export QBR
                </button>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-500 flex items-center gap-1.5">
                  <Calendar size={12} /> Schedule Review
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Avg Network OTD', value: '92.3%', target: '95%', icon: PackageCheck, color: 'amber', delta: '+0.8pp' },
                { label: 'Billing Accuracy', value: '95.2%', target: '98%', icon: Receipt, color: 'amber', delta: '+1.2pp' },
                { label: 'Claims Rate', value: '0.27%', target: '<0.20%', icon: AlertTriangle, color: 'rose', delta: '-0.04pp' },
                { label: 'Avg CSAT', value: '4.0/5', target: '4.3/5', icon: ThumbsUp, color: 'amber', delta: '+0.1' },
              ].map(k => (
                <div key={k.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <k.icon size={18} className={`text-${k.color}-400`} />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold bg-${k.color}-500/15 text-${k.color}-300`}>{k.delta}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{k.value}</p>
                  <p className="text-[11px] text-slate-400">{k.label}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Target: {k.target}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-medium text-white">Carrier Performance Matrix</h4>
                <div className="flex gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" />On Track</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" />Watch</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full" />Action Required</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-800/50">
                    <tr className="text-slate-400">
                      <th className="text-left p-3 font-medium">Carrier</th>
                      <th className="text-right p-3 font-medium">YTD Spend</th>
                      <th className="text-right p-3 font-medium">Shipments</th>
                      <th className="text-right p-3 font-medium">OTD %</th>
                      <th className="p-3 font-medium">12-mo Trend</th>
                      <th className="text-right p-3 font-medium">Billing Acc</th>
                      <th className="text-right p-3 font-medium">Claims %</th>
                      <th className="text-right p-3 font-medium">CSAT</th>
                      <th className="p-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {carrierScorecard.map(c => (
                      <tr key={c.carrier} onClick={() => setSelectedCarrier(selectedCarrier === c.carrier ? null : c.carrier)} className="hover:bg-slate-800/40 cursor-pointer transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <StatusDot flag={c.riskFlag} />
                            <span className="font-semibold text-white">{c.carrier}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right text-white font-medium">${c.ytdSpend}M</td>
                        <td className="p-3 text-right text-slate-300">{c.shipments.toLocaleString()}</td>
                        <td className={`p-3 text-right font-semibold ${c.otd >= 95 ? 'text-emerald-400' : c.otd >= 90 ? 'text-amber-400' : 'text-rose-400'}`}>{c.otd}%</td>
                        <td className="p-3"><Sparkline data={c.sparkOTD} color={c.otd >= 95 ? '#10b981' : c.otd >= 90 ? '#f59e0b' : '#f43f5e'} /></td>
                        <td className={`p-3 text-right font-medium ${c.billingAccuracy >= 97 ? 'text-emerald-400' : 'text-amber-400'}`}>{c.billingAccuracy}%</td>
                        <td className={`p-3 text-right font-medium ${c.claimsRate <= 0.20 ? 'text-emerald-400' : c.claimsRate <= 0.30 ? 'text-amber-400' : 'text-rose-400'}`}>{c.claimsRate}%</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= Math.round(c.csat) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'} />)}
                          </div>
                        </td>
                        <td className="p-3">
                          {c.riskFlag === 'red' ? <span className="px-2 py-0.5 bg-rose-500/15 text-rose-300 rounded text-[10px] font-semibold">CAR Required</span> :
                           c.riskFlag === 'yellow' ? <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 rounded text-[10px] font-semibold">Monitor</span> :
                           <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded text-[10px] font-semibold">Maintain</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedCarrier && (() => {
              const c = carrierScorecard.find(x => x.carrier === selectedCarrier);
              if (!c) return null;
              return (
                <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-blue-500/30 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <Building2 size={18} className="text-blue-400" />
                      {c.carrier} Deep Dive
                    </h4>
                    <button onClick={() => setSelectedCarrier(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs text-slate-400 uppercase tracking-wide mb-2">OTD vs SLA Trend</h5>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={c.sparkOTD.map((v, i) => ({ month: monthLabels[i], otd: v, sla: 95 }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis domain={[80, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: 11 }} />
                          <Line type="monotone" dataKey="sla" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="SLA Target" />
                          <Line type="monotone" dataKey="otd" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Actual OTD" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h5 className="text-xs text-slate-400 uppercase tracking-wide mb-2">Performance Radar</h5>
                      <ResponsiveContainer width="100%" height={180}>
                        <RadarChart data={[
                          { metric: 'OTD', value: c.otd },
                          { metric: 'Billing', value: c.billingAccuracy },
                          { metric: 'Claims', value: 100 - c.claimsRate * 50 },
                          { metric: 'Disputes', value: 100 - c.invoiceDispute * 5 },
                          { metric: 'CSAT', value: c.csat * 20 },
                        ]}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                          <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h4 className="font-medium text-white mb-3">Cost vs Service Performance Quadrant</h4>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="otd" name="OTD" domain={[84, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'On-Time Delivery %', position: 'bottom', offset: -5, fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="number" dataKey="ytdSpend" name="Spend" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'YTD Spend ($M)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                  <ZAxis type="number" dataKey="shipments" range={[100, 800]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v, n) => n === 'OTD' ? `${v}%` : n === 'Spend' ? `$${v}M` : v.toLocaleString()} />
                  <Scatter data={carrierScorecard}>
                    {carrierScorecard.map((c, i) => <Cell key={i} fill={CARRIER_COLORS[c.carrier] || COLORS[i]} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ===================== SPEND ANALYTICS TAB ===================== */}
        {activeTab === 'spend' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><BarChart3 size={20} className="text-blue-400" />Spend Analytics</h3>
                <p className="text-xs text-slate-400 mt-1">Total ${spendAnalytics.totalYTD}M YTD • {spendAnalytics.yoyChange > 0 ? '+' : ''}{spendAnalytics.yoyChange}% YoY</p>
              </div>
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                {['mode', 'region', 'monthly'].map(v => (
                  <button key={v} onClick={() => setSpendView(v)} className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-all ${spendView === v ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>{v}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'YTD Spend', value: `$${spendAnalytics.totalYTD}M`, sub: `+${spendAnalytics.yoyChange}% YoY`, icon: DollarSign, color: 'blue' },
                { label: 'Total Shipments', value: '220K+', sub: 'across 6 modes', icon: PackageCheck, color: 'purple' },
                { label: 'Avg Cost/Shipment', value: '$369', sub: '-4.2% YoY', icon: TrendingDown, color: 'emerald' },
                { label: 'vs Market Index', value: '-3.8%', sub: '$3.1M favorable', icon: Gauge, color: 'amber' },
              ].map(k => (
                <div key={k.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <k.icon size={18} className={`text-${k.color}-400 mb-2`} />
                  <p className="text-2xl font-bold text-white">{k.value}</p>
                  <p className="text-[11px] text-slate-400">{k.label}</p>
                  <p className={`text-[10px] mt-1 text-${k.color}-400 font-medium`}>{k.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-slate-900 rounded-xl p-4 border border-slate-800">
                <h4 className="font-medium text-white mb-3">
                  {spendView === 'mode' && 'Spend by Mode'}
                  {spendView === 'region' && 'Spend by Region'}
                  {spendView === 'monthly' && 'Monthly Spend vs Market Index'}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  {spendView === 'monthly' ? (
                    <ComposedChart data={spendAnalytics.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}M`} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v) => `$${v}M`} />
                      <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actual Spend" />
                      <Line type="monotone" dataKey="market" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Market Index" />
                      <Line type="monotone" dataKey="baseline" stroke="#10b981" strokeWidth={1.5} dot={false} name="Baseline" />
                    </ComposedChart>
                  ) : (
                    <BarChart data={spendView === 'mode' ? spendAnalytics.byMode : spendAnalytics.byRegion} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}M`} />
                      <YAxis type="category" dataKey={spendView === 'mode' ? 'mode' : 'region'} width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v) => `$${v}M`} />
                      <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                        {(spendView === 'mode' ? spendAnalytics.byMode : spendAnalytics.byRegion).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <h4 className="font-medium text-white mb-3">Carrier Mix</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={carrierScorecard} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="ytdSpend" label={({ carrier, ytdSpend }) => `${carrier}: $${ytdSpend}M`} labelLine={false} fontSize={10}>
                      {carrierScorecard.map((c, i) => <Cell key={i} fill={CARRIER_COLORS[c.carrier] || COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-3 border-b border-slate-800">
                <h4 className="font-medium text-white">Mode Performance Detail</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-slate-800">
                {spendAnalytics.byMode.map((m) => (
                  <div key={m.mode} className="bg-slate-900 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {m.mode === 'Parcel' && <PackageCheck size={14} className="text-blue-400" />}
                      {m.mode === 'Air Freight' && <Plane size={14} className="text-purple-400" />}
                      {m.mode === 'Ocean' && <Ship size={14} className="text-cyan-400" />}
                      {m.mode === 'LTL/FTL' && <Truck size={14} className="text-amber-400" />}
                      {m.mode === 'Other' && <Layers size={14} className="text-slate-400" />}
                      <span className="text-xs text-slate-300 font-medium">{m.mode}</span>
                    </div>
                    <p className="text-xl font-bold text-white">${m.spend}M</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{m.pct}% of total</p>
                    <p className="text-[10px] text-slate-500">{m.shipments.toLocaleString()} shipments</p>
                    <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-medium text-white flex items-center gap-2"><Sparkles size={16} className="text-emerald-400" />Identified Savings Opportunities</h4>
                <span className="text-xs text-emerald-400 font-semibold">${spendAnalytics.topOpportunities.reduce((s, o) => s + o.impact, 0).toFixed(1)}M total potential</span>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="text-left p-3 font-medium">Opportunity</th>
                    <th className="text-right p-3 font-medium">Impact</th>
                    <th className="text-center p-3 font-medium">Effort</th>
                    <th className="text-center p-3 font-medium">Timeline</th>
                    <th className="text-right p-3 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {spendAnalytics.topOpportunities.map((o, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-white font-medium">{o.name}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">${o.impact}M</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${o.effort === 'Low' ? 'bg-emerald-500/15 text-emerald-300' : o.effort === 'Medium' ? 'bg-amber-500/15 text-amber-300' : 'bg-rose-500/15 text-rose-300'}`}>{o.effort}</span>
                      </td>
                      <td className="p-3 text-center text-slate-300">{o.timeline}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${o.confidence}%` }} />
                          </div>
                          <span className="text-slate-300 text-[11px] w-8">{o.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== LANE INTELLIGENCE TAB ===================== */}
        {activeTab === 'lanes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Map size={20} className="text-cyan-400" />Lane Intelligence</h3>
                <p className="text-xs text-slate-400 mt-1">{topLanes.length} active lanes • ${topLanes.reduce((s, l) => s + l.spend, 0).toFixed(1)}M tracked spend</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select value={laneFilter} onChange={e => setLaneFilter(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500">
                  <option value="all">All Modes</option>
                  <option value="air">Air</option>
                  <option value="ocean">Ocean</option>
                  <option value="parcel">Parcel</option>
                  <option value="ltl">LTL</option>
                </select>
                <select value={laneSort} onChange={e => setLaneSort(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500">
                  <option value="spend">Sort: Spend</option>
                  <option value="volume">Sort: Volume</option>
                  <option value="co2">Sort: CO2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Top 10 Lanes Spend', value: `$${topLanes.reduce((s, l) => s + l.spend, 0).toFixed(1)}M`, sub: '32% of total', icon: Route, color: 'cyan' },
                { label: 'High-Risk Lanes', value: topLanes.filter(l => l.flag === 'high').length, sub: 'flagged for review', icon: AlertTriangle, color: 'rose' },
                { label: 'Optimization Pot.', value: '$2.1M', sub: 'identified', icon: Sparkles, color: 'emerald' },
                { label: 'Total CO2', value: `${(topLanes.reduce((s, l) => s + l.co2, 0) / 1000).toFixed(1)}t`, sub: 'CO2e tracked', icon: Leaf, color: 'green' },
              ].map(k => (
                <div key={k.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <k.icon size={18} className={`text-${k.color}-400 mb-2`} />
                  <p className="text-2xl font-bold text-white">{k.value}</p>
                  <p className="text-[11px] text-slate-400">{k.label}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{k.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLanes.map(lane => (
                <div key={lane.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${lane.flag === 'high' ? 'bg-rose-500' : lane.flag === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] text-slate-400 font-mono">LANE-{String(lane.id).padStart(3, '0')}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          lane.mode === 'Air' ? 'bg-purple-500/15 text-purple-300' :
                          lane.mode === 'Ocean' ? 'bg-cyan-500/15 text-cyan-300' :
                          lane.mode === 'Parcel' ? 'bg-blue-500/15 text-blue-300' :
                          'bg-amber-500/15 text-amber-300'
                        }`}>{lane.mode}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white font-medium">
                        <span>{lane.origin}</span>
                        <ArrowRight size={14} className="text-slate-500" />
                        <span>{lane.dest}</span>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xl font-bold text-white">${lane.spend}M</p>
                      <p className="text-[10px] text-slate-500">{lane.shipments.toLocaleString()} ship.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[11px]">
                    <div>
                      <p className="text-slate-500 mb-0.5">Primary</p>
                      <p className="text-white font-medium">{lane.primary}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">Avg Weight</p>
                      <p className="text-white font-medium">{lane.avgWeight} lbs</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5 flex items-center gap-1"><Leaf size={10} />CO2e</p>
                      <p className="text-white font-medium">{lane.co2}t</p>
                    </div>
                  </div>
                  <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 text-[11px] ${
                    lane.flag === 'high' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300' :
                    lane.flag === 'medium' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' :
                    'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  }`}>
                    {lane.flag === 'high' ? <AlertCircle size={12} /> : <Sparkles size={12} />}
                    <span className="font-medium">{lane.opportunity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TIMELINE TAB ===================== */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-lg flex items-center gap-2"><Calendar size={20} className="text-blue-400" />Project Timeline & Roadmap</h3>
              <div className="flex gap-2">
                {['gantt', 'list'].map(v => (
                  <button key={v} onClick={() => setTimelineView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timelineView === v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {v === 'gantt' ? 'Gantt View' : 'List View'}
                  </button>
                ))}
              </div>
            </div>

            {timelineView === 'gantt' && (
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <div className="min-w-[1000px]">
                  <div className="grid grid-cols-[200px_repeat(24,1fr)] gap-0 mb-2 text-xs text-slate-400 border-b border-slate-700 pb-2">
                    <div className="font-medium">Project</div>
                    {[2025, 2026].map(y => months.map(m => <div key={`${y}-${m}`} className="text-center text-[10px]">{m.substring(0, 1)}</div>))}
                  </div>
                  <div className="space-y-1">
                    {projectTimeline.map(p => {
                      const start = getMonthIndex(p.start);
                      const end = getMonthIndex(p.end);
                      return (
                        <div key={p.id} className="grid grid-cols-[200px_repeat(24,1fr)] gap-0 items-center py-2 hover:bg-slate-800/40 rounded cursor-pointer" onClick={() => setSelectedProject(selectedProject === p.id ? null : p.id)}>
                          <div className="pr-2">
                            <p className="font-medium text-white text-xs truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-500">{p.owner} • {p.progress}%</p>
                          </div>
                          {Array.from({ length: 24 }, (_, i) => (
                            <div key={i} className="h-6 relative">
                              {i >= start && i <= end && (
                                <div className={`absolute inset-y-1 ${i === start ? 'left-0 rounded-l-full' : 'left-0'} ${i === end ? 'right-0 rounded-r-full' : 'right-0'} ${p.status === 'In Progress' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : p.status === 'Planned' ? 'bg-gradient-to-r from-purple-500 to-purple-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}>
                                  {i === start && <div className="absolute inset-y-0 left-0 bg-white/30 rounded-l-full" style={{ width: `${p.progress}%`, maxWidth: '100%' }} />}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {selectedProject && (
                  <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-blue-500/30">
                    {(() => {
                      const p = projectTimeline.find(x => x.id === selectedProject);
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div><p className="text-xs text-slate-400">Project</p><p className="text-white font-medium">{p.name}</p></div>
                          <div><p className="text-xs text-slate-400">Impact</p><p className="text-emerald-400 font-bold">{p.impact}</p></div>
                          <div><p className="text-xs text-slate-400">Timeline</p><p className="text-white">{p.start} -&gt; {p.end}</p></div>
                          <div><p className="text-xs text-slate-400">Progress</p><p className="text-white">{p.progress}%</p></div>
                          <div><p className="text-xs text-slate-400">Owner</p><p className="text-white">{p.owner}</p></div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {timelineView === 'list' && (
              <div className="space-y-2">
                {projectTimeline.map(p => (
                  <div key={p.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-white">{p.name}</h4>
                        <p className="text-xs text-slate-400">{p.category} • {p.owner}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">{p.impact}</p>
                          <p className="text-xs text-slate-500">Impact</p>
                        </div>
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400">Progress</span>
                            <span className="text-[10px] text-white font-semibold">{p.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${p.progress}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-xs">{p.start} -&gt; {p.end}</p>
                          <p className="text-[10px] text-slate-500">Timeline</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'In Progress' ? 'bg-blue-500/15 text-blue-300' : 'bg-purple-500/15 text-purple-300'}`}>{p.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== QUOTE TAB ===================== */}
        {activeTab === 'quote' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              {['Shipment Info', 'Package Details', 'Services', 'Review & Quote'].map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${quoteStep > i ? 'bg-emerald-500 text-white' : quoteStep === i ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {quoteStep > i ? <Check size={16} /> : i + 1}
                  </div>
                  <span className={`ml-2 text-xs ${quoteStep >= i ? 'text-white' : 'text-slate-500'}`}>{step}</span>
                  {i < 3 && <div className={`w-12 h-0.5 mx-3 ${quoteStep > i ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              {quoteStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Shipment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Business Unit *</label>
                      <select value={quoteData.bu} onChange={e => setQuoteData({ ...quoteData, bu: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        <option value="">Select Business Unit</option>
                        {businessUnits.map(bu => <option key={bu} value={bu}>{bu}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Commodity Type *</label>
                      <select value={quoteData.commodity} onChange={e => setQuoteData({ ...quoteData, commodity: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        <option value="">Select Commodity</option>
                        {commodityTypes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Origin (City, Country) *</label>
                      <input type="text" value={quoteData.origin} onChange={e => setQuoteData({ ...quoteData, origin: e.target.value })} placeholder="e.g., Schaumburg, IL USA" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Destination (City, Country) *</label>
                      <input type="text" value={quoteData.dest} onChange={e => setQuoteData({ ...quoteData, dest: e.target.value })} placeholder="e.g., Munich, Germany" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Incoterms *</label>
                      <select value={quoteData.incoterm} onChange={e => setQuoteData({ ...quoteData, incoterm: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        {incoterms.map(i => <option key={i.code} value={i.code}>{i.code} - {i.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Declared Value ($)</label>
                      <input type="number" value={quoteData.value} onChange={e => setQuoteData({ ...quoteData, value: e.target.value })} placeholder="e.g., 5000" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button onClick={() => setQuoteStep(1)} disabled={!quoteData.bu || !quoteData.origin || !quoteData.dest || !quoteData.commodity} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {quoteStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Package Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Packaging Type *</label>
                      <select value={quoteData.packaging} onChange={e => setQuoteData({ ...quoteData, packaging: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        <option value="">Select Packaging</option>
                        {packagingTypes.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Number of Pieces *</label>
                      <input type="number" value={quoteData.qty} onChange={e => setQuoteData({ ...quoteData, qty: e.target.value })} min="1" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Weight per Piece (lbs) *</label>
                      <input type="number" value={quoteData.weight} onChange={e => setQuoteData({ ...quoteData, weight: e.target.value })} placeholder="e.g., 25" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Dimensions (L x W x H inches) *</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" value={quoteData.dims.l} onChange={e => setQuoteData({ ...quoteData, dims: { ...quoteData.dims, l: e.target.value } })} placeholder="L" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                        <input type="number" value={quoteData.dims.w} onChange={e => setQuoteData({ ...quoteData, dims: { ...quoteData.dims, w: e.target.value } })} placeholder="W" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                        <input type="number" value={quoteData.dims.h} onChange={e => setQuoteData({ ...quoteData, dims: { ...quoteData.dims, h: e.target.value } })} placeholder="H" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={quoteData.hazmat} onChange={e => setQuoteData({ ...quoteData, hazmat: e.target.checked })} className="rounded bg-slate-700 border-slate-600" />
                      Hazmat / Dangerous Goods
                    </label>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button onClick={() => setQuoteStep(0)} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm">Back</button>
                    <button onClick={() => setQuoteStep(2)} disabled={!quoteData.weight || !quoteData.dims.l || !quoteData.dims.w || !quoteData.dims.h || !quoteData.packaging} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {quoteStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Service Requirements</h3>
                  <div>
                    <label className="block text-sm text-slate-400 mb-3">Urgency Level *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'critical', label: 'Critical', desc: 'Next day / ASAP', icon: Zap, color: 'rose' },
                        { id: 'expedited', label: 'Expedited', desc: '2-3 days', icon: Plane, color: 'orange' },
                        { id: 'standard', label: 'Standard', desc: '4-7 days', icon: Truck, color: 'blue' },
                        { id: 'economy', label: 'Economy', desc: '7+ days / Ocean', icon: Ship, color: 'emerald' },
                      ].map(u => (
                        <button key={u.id} onClick={() => setQuoteData({ ...quoteData, urgency: u.id })} className={`p-4 rounded-xl border-2 transition-all text-left ${quoteData.urgency === u.id ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 hover:border-slate-600'}`}>
                          <u.icon size={22} className={`mb-2 ${quoteData.urgency === u.id ? 'text-blue-400' : 'text-slate-400'}`} />
                          <p className="font-medium text-white text-sm">{u.label}</p>
                          <p className="text-[10px] text-slate-400">{u.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm text-slate-400 mb-3">Additional Services</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: 'liftgate', label: 'Liftgate Required', cost: '+$75' },
                        { id: 'residential', label: 'Residential Delivery', cost: '+$4.50' },
                        { id: 'appointment', label: 'Delivery Appointment', cost: '+$35' },
                        { id: 'insurance', label: 'Additional Insurance', cost: '2.5% of value' },
                      ].map(s => (
                        <label key={s.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${quoteData[s.id] ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 hover:border-slate-600'}`}>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={quoteData[s.id]} onChange={e => setQuoteData({ ...quoteData, [s.id]: e.target.checked })} className="rounded bg-slate-700 border-slate-600 text-blue-500" />
                            <span className="text-white text-sm">{s.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{s.cost}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button onClick={() => setQuoteStep(1)} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm">Back</button>
                    <button onClick={calculateQuote} disabled={!quoteData.urgency} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                      <Calculator size={14} /> Get Quote
                    </button>
                  </div>
                </div>
              )}

              {quoteStep === 4 && quoteResult && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recommended Carriers & Rates</h3>
                    <button onClick={resetQuote} className="text-sm text-blue-400 hover:text-blue-300">Start New Quote</button>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <TrendingDown size={20} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Saving ${quoteResult.savingsVsSpot.toFixed(2)} ({quoteResult.savingsPct}%) vs spot market</p>
                        <p className="text-[11px] text-slate-400">Contracted rate: ${quoteResult.recommendations[0].cost.toFixed(2)} • Spot index: ${quoteResult.spotRate.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">{quoteResult.savingsPct}%</p>
                      <p className="text-[10px] text-slate-400">below market</p>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div><p className="text-[10px] text-slate-400">Route</p><p className="text-white font-medium text-xs">{quoteData.origin} -&gt; {quoteData.dest}</p></div>
                    <div><p className="text-[10px] text-slate-400">Actual Wt</p><p className="text-white font-medium">{quoteResult.actualWeight} lbs</p></div>
                    <div><p className="text-[10px] text-slate-400">DIM Wt</p><p className="text-white font-medium">{quoteResult.dimWeight} lbs</p></div>
                    <div><p className="text-[10px] text-slate-400">Billable</p><p className="text-emerald-400 font-bold">{quoteResult.billableWeight} lbs</p></div>
                    <div><p className="text-[10px] text-slate-400">Incoterm</p><p className="text-white font-medium">{quoteResult.incoterm?.code}</p></div>
                  </div>

                  <div className="space-y-3">
                    {quoteResult.recommendations.map((rec, i) => (
                      <div key={i} className={`rounded-xl border-2 p-4 ${i === 0 ? 'border-emerald-500 bg-emerald-900/15' : 'border-slate-700'}`}>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            {i === 0 && <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">RECOMMENDED</span>}
                            <div>
                              <p className="text-xl font-bold text-white">{rec.carrier}</p>
                              <p className="text-xs text-slate-400">{rec.service}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-emerald-400">${rec.cost.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-400">Estimated Total</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 pt-3 border-t border-slate-700">
                          <div><p className="text-[10px] text-slate-400">Transit</p><p className="text-white text-xs">{rec.transit}</p></div>
                          <div><p className="text-[10px] text-slate-400">Confidence</p><p className="text-white text-xs">{rec.confidence}%</p></div>
                          <div><p className="text-[10px] text-slate-400">Base Rate</p><p className="text-white text-xs">${rec.baseCost.toFixed(2)}</p></div>
                          <div><p className="text-[10px] text-slate-400">Accessorials</p><p className="text-white text-xs">${quoteResult.accessorialTotal.toFixed(2)}</p></div>
                          <div><p className="text-[10px] text-slate-400 flex items-center gap-1"><Leaf size={9} />CO2e</p><p className="text-emerald-300 text-xs font-medium">{rec.co2.toFixed(1)} kg</p></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {quoteResult.accessorials.length > 0 && (
                    <div className="bg-slate-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">Accessorial Charges</h4>
                      <div className="space-y-1">
                        {quoteResult.accessorials.map((a, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-300">{a.name}</span>
                            <span className="text-white">${a.cost.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                      <div>
                        <p className="font-medium text-white">{quoteResult.incoterm?.code} - {quoteResult.incoterm?.name}</p>
                        <p className="text-xs text-slate-300 mt-1">{quoteResult.incoterm?.desc}</p>
                        <div className="flex gap-4 mt-2 text-[11px]">
                          <span className="text-slate-400">Buyer Risk: <span className="text-white">{quoteResult.incoterm?.buyerRisk}</span></span>
                          <span className="text-slate-400">Seller Risk: <span className="text-white">{quoteResult.incoterm?.sellerRisk}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {quoteResult.sop && (
                    <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <BookOpen className="text-purple-400" size={18} />
                          <div>
                            <p className="font-medium text-white text-sm">{quoteResult.sop.title}</p>
                            <p className="text-[10px] text-slate-400">{quoteResult.sop.doc}</p>
                          </div>
                        </div>
                        <button onClick={() => setShowSOP(quoteResult.sop)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 flex items-center gap-2 text-xs">
                          <ExternalLink size={12} /> View SOP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== AGREEMENTS TAB ===================== */}
        {activeTab === 'agreements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-lg flex items-center gap-2"><FileText size={20} className="text-blue-400" />Contract Lifecycle Management</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center gap-2 text-xs">
                <Upload size={14} /> Upload Agreement
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Active Agreements', value: agreements.length, icon: FileText, color: 'blue' },
                { label: 'Carriers Covered', value: 5, icon: Truck, color: 'emerald' },
                { label: 'Services Mapped', value: agreements.reduce((sum, a) => sum + a.services.length, 0), icon: Layers, color: 'purple' },
                { label: 'Expiring <90 Days', value: agreements.filter(a => daysUntil(a.expires) < 90 && daysUntil(a.expires) > 0).length, icon: AlertTriangle, color: 'amber' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <stat.icon size={18} className={`text-${stat.color}-400 mb-2`} />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2"><Clock4 size={16} className="text-amber-400" />Contract Expiration Timeline</h4>
              <div className="space-y-2">
                {[...agreements].sort((a, b) => daysUntil(a.expires) - daysUntil(b.expires)).map(agr => {
                  const days = daysUntil(agr.expires);
                  const flagColor = days < 60 ? 'rose' : days < 120 ? 'amber' : 'emerald';
                  return (
                    <div key={agr.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                      <div className={`w-2 h-2 rounded-full bg-${flagColor}-500`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{agr.carrier} • {agr.mode} • {agr.region}</p>
                        <p className="text-[11px] text-slate-500">Expires {agr.expires}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-${flagColor}-400 font-bold text-sm`}>{days} days</p>
                        <p className="text-[10px] text-slate-500">{days < 60 ? 'Action required' : days < 120 ? 'Plan renewal' : 'On track'}</p>
                      </div>
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-${flagColor}-500 rounded-full`} style={{ width: `${Math.min(100, 100 - (days / 365) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h4 className="font-medium text-white">Carrier Rate Agreements</h4>
              </div>
              <div className="divide-y divide-slate-800">
                {agreements.map(agr => (
                  <div key={agr.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <p className="font-medium text-white">{agr.carrier}</p>
                        <p className="text-xs text-slate-400">{agr.mode} • {agr.region} • Expires {agr.expires}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-1 rounded font-semibold">Active</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {agr.services.map((svc, i) => (
                        <div key={i} className="bg-slate-800/60 rounded p-2 text-xs border border-slate-700/50">
                          <p className="font-medium text-white truncate">{svc.service}</p>
                          <p className="text-slate-400">{svc.transitDays} days</p>
                          <p className="text-emerald-400 font-medium">${svc.baseRate} base</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== SOP TAB ===================== */}
        {activeTab === 'sop' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg flex items-center gap-2"><BookOpen size={20} className="text-purple-400" />Standard Operating Procedures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sopLibrary.map(sop => (
                <div key={sop.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-white">{sop.title}</h4>
                      <p className="text-xs text-slate-400">{sop.doc} • {sop.mode}</p>
                    </div>
                    <span className="text-[10px] bg-blue-500/15 text-blue-300 px-2 py-1 rounded font-semibold">{sop.mode}</span>
                  </div>
                  <div className="space-y-1.5">
                    {sop.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                        <span className="text-slate-300">{step}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { navigator.clipboard?.writeText(sop.steps.join('\n')); setCopiedSOP(true); setTimeout(() => setCopiedSOP(false), 2000); }} className="mt-4 w-full py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2 text-sm">
                    {copiedSOP ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Steps</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== SOP MODAL ===================== */}
        {showSOP && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto border border-slate-700">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-900">
                <div>
                  <h3 className="font-semibold text-white">{showSOP.title}</h3>
                  <p className="text-xs text-slate-400">{showSOP.doc}</p>
                </div>
                <button onClick={() => setShowSOP(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-4 space-y-3">
                {showSOP.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                    <p className="text-white text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
