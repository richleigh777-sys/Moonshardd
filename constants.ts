
import { User, ProductConfig, PipelineStage, ObjectionType } from './types';
import { ShieldAlert, CreditCard, UserX, Smartphone, DollarSign, Users, AlertTriangle, HelpCircle, PhoneOff, Zap, MapPin, Search, XCircle, RefreshCw } from 'lucide-react';

export const SYSTEM_ADMIN_ID = 'sys_root';

export const CORE_BASIS = {
  PILLAR_1: { title: "Daily Care", detail: "Standard wellness procedures." },
  PILLAR_2: { title: "Wellness Path", detail: "Journey tracking in real-time." },
  PILLAR_3: { title: "Understanding", detail: "Transparent sharing of help provided." },
  PILLAR_4: { title: "Safety Hub", detail: "Member comfort and privacy." }
};

export const PIPELINE_STAGES: PipelineStage[] = [
  'New Order', 
  'Reorder', 
  'Retention' , 
  'Referral', 
  'Winback'
];

export const STAGE_PROBABILITIES: Record<PipelineStage, number> = {
    'New Order': 100,
    'Reorder': 100,
    'Retention': 80,
    'Referral': 90,
    'Winback': 40,
    'Cold Lead': 10,
    'Pitching': 30,
    'Rebuttal': 40,
    'Closed Won': 100,
    'Closed Lost': 0
};

export const STAGE_STYLES: Record<PipelineStage, { color: string, bg: string, label: string, icon: any }> = {
    'New Order': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'New Orders', icon: Zap },
    'Reorder': { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Reorders', icon: Zap },
    'Retention': { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Retention Check', icon: ShieldAlert },
    'Referral': { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Referrals', icon: Users },
    'Winback': { color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Winbacks', icon: RefreshCw },
    'Cold Lead': { color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Cold Leads', icon: Users },
    'Pitching': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Pitching', icon: Zap },
    'Rebuttal': { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Rebuttals', icon: ShieldAlert },
    'Closed Won': { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Closed Won', icon: Zap },
    'Closed Lost': { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Closed Lost', icon: XCircle }
};

export const RESCUE_SCRIPTS: Record<string, string> = {
  'Bank Security Hold': "<b>[Partner]:</b> I have lovely news, [Name]. Your bank is doing a great job looking after you. They just need a quick 'Yes' to welcome us as a new friend. <br/><br/><b>[Solution]:</b> Would you mind checking for a friendly text from them? I'm happy to wait while you reply YES.",
  'Insufficient Funds': "<b>[Partner]:</b> I completely understand. Life moves fast, and budgets have boundaries. It happens to the best of us.<br/><br/><b>[Solution]:</b> To help you stay on your wellness path, we could try a smaller starting package or use a secondary card you're more comfortable with?",
  'Do Not Honor': "<b>[Partner]:</b> Your bank is just being extra thoughtful today. They want to make sure you're the one making this choice for your health.<br/><br/><b>[Solution]:</b> A quick call to the friendly number on your card will clear this right up. I'll stay right here with you.",
  'Cant Find Card': "<b>[Partner]:</b> Please, no rush at all. Take your time. I'll keep our connection open while you look.<br/><br/><b>[Solution]:</b> Most friends find it in their favorite purse or the nightstand drawer. I'll be here whenever you're ready.",
  'Trust/Scam Fear': "<b>[Partner]:</b> That is a wonderful question. It shows you value your peace of mind. I truly appreciate your care.<br/><br/><b>[Solution]:</b> That's exactly why we have our 30-day promise. We want you to feel nothing but comfort. Does that sound fair?",
  'High Risk / Fraud Alert': "<b>[Partner]:</b> I appreciate your bank's diligence in keeping your accounts safe. They just need a simple confirmation that this is a purchase you've authorized for your wellness package. <br/><br/><b>[Solution]:</b> If you can give them a quick call or check your app, we can finalize your journey together.",
  'Price': "<b>[Partner]:</b> I hear you—your health is an investment, and we want it to feel like a comfortable one. <br/><br/><b>[Solution]:</b> We actually have a smaller 'Friendship Starter' pack that provides the same care at a lower entry point. Would that help you start your path today?",
};

export const RECOVERY_SCRIPTS = RESCUE_SCRIPTS;

// SECURITY UPDATE: Hardcoded credentials removed.
// Users are now generated dynamically in cloudService.ts if the database is empty.
export const VALID_USERS: User[] = [];

export const MEDICAL_CONDITIONS = [
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "High Cholesterol",
  "Obesity",
  "Low Testosterone",
  "Enlarged Prostate (BPH)",
  "Depression / Anxiety",
  "Sleep Apnea",
  "Smoking / Tobacco Use"
];

export const INITIAL_PRODUCT_CONFIG: ProductConfig = {
  products: [
    { id: '1', name: 'Gentle Formula', price: 59.00, dosages: ['Maintenance', 'Daily'], active: true },
    { id: '2', name: 'Vitality Support', price: 89.00, dosages: ['Standard', 'Enhanced'], active: true },
    { id: '3', name: 'Inner Peace Core', price: 149.00, dosages: ['Daily', 'Concentrated'], active: true },
  ],
  quantities: ["30 Day Supply", "90 Day Supply", "180 Day Supply"],
  medicalConditions: MEDICAL_CONDITIONS,
  teams: ["Unity", "Harmony", "Growth", "Grace"]
};

export const SALE_LABELS = [
  "Cherished Friend", "Loyal Member", "New Journey", "Follow-up Needed"
];

export const MOTIVATION_QUOTES = [
  "A kind word is the best path to a closed deal.",
  "Listening is the highest form of respect.",
  "Every person you help is a victory for wellness.",
  "Growth happens in the space of understanding.",
  "Be the reason someone smiles today."
];

export const OBJECTION_METADATA: Record<ObjectionType, { label: string, icon: any, color: string, category: 'Financial' | 'Trust' | 'Logistics' | 'Other' }> = {
  'Bank Security Hold': { label: 'Bank Check', icon: ShieldAlert, color: 'text-red-500', category: 'Financial' },
  'Insufficient Funds': { label: 'Budget Limit', icon: CreditCard, color: 'text-amber-500', category: 'Financial' },
  'Do Not Honor': { label: 'Bank Review', icon: UserX, color: 'text-red-600', category: 'Financial' },
  'Issuer Declined': { label: 'Card Issuer', icon: Smartphone, color: 'text-red-400', category: 'Financial' },
  'Invalid Card Number': { label: 'Number Check', icon: CreditCard, color: 'text-amber-600', category: 'Logistics' },
  'Card Not Activated': { label: 'Not Active', icon: Zap, color: 'text-amber-400', category: 'Logistics' },
  'Daily Limit Exceeded': { label: 'Daily Limit', icon: DollarSign, color: 'text-amber-500', category: 'Financial' },
  'Billing Address Mismatch': { label: 'Address Check', icon: MapPin, color: 'text-amber-600', category: 'Logistics' },
  'High Risk / Fraud Alert': { label: 'Security Alert', icon: ShieldAlert, color: 'text-red-700', category: 'Trust' },
  'Cant Find Card': { label: 'Card Missing', icon: Search, color: 'text-blue-500', category: 'Other' },
  'Trust/Scam Fear': { label: 'Peace of Mind', icon: HelpCircle, color: 'text-indigo-500', category: 'Trust' },
  'Price': { label: 'Price Comfort', icon: DollarSign, color: 'text-blue-600', category: 'Financial' },
  'Not Interested': { label: 'Not Ready', icon: XCircle, color: 'text-slate-500', category: 'Other' },
  'Competitor': { label: 'Competitor', icon: Users, color: 'text-slate-600', category: 'Other' },
  'Wrong Person': { label: 'Wrong Number', icon: UserX, color: 'text-slate-400', category: 'Logistics' },
  'Disconnected': { label: 'Disconnected', icon: PhoneOff, color: 'text-slate-300', category: 'Logistics' },
  'Other': { label: 'Other Reason', icon: AlertTriangle, color: 'text-slate-500', category: 'Other' }
};

export const OBJECTION_TYPES = Object.keys(OBJECTION_METADATA) as ObjectionType[];
export const DECLINE_REASONS = OBJECTION_TYPES;

export const TOP_US_BANKS = ['JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citigroup'];
export const CARD_PROVIDERS = ['Visa', 'Mastercard', 'Amex', 'Discover'];

export const SALES_TIPS = [
  "Listen more than you talk.",
  "Always follow up with kindness."
];

export const WISDOM_COLLECTION = [
  { category: 'Mindset', text: "A kind word is the best path to a closed deal." },
  { category: 'Tactics', text: "Listening is the highest form of respect." },
  { category: 'Closing', text: "Every person you help is a victory for wellness." }
];

export const RETENTION_SCHEDULE = [
  { days: 7, label: "Wellness Check" },
  { days: 30, label: "Month 1 Review" },
  { days: 60, label: "Refill Chat" }
];

export const getAgentAvatar = (id: string) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${id}&backgroundColor=b6e3f4`;
