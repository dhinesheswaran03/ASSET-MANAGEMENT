import { useEffect, useState, useRef } from "react";
import {
  Container, Typography, Card, CardContent, Box, Fab, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Button,
  ToggleButton, ToggleButtonGroup, Chip, IconButton, Avatar,
  LinearProgress, Menu, MenuItem, Tooltip, Snackbar, Alert,
  Grid, Paper, Select, FormControl, InputLabel, Table,
  TableBody, TableCell, TableHead, TableRow, Badge, Drawer, Divider, Checkbox, Collapse
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BalanceIcon from "@mui/icons-material/Balance";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import GoogleIcon from "@mui/icons-material/Google";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TableChartIcon from "@mui/icons-material/TableChart";
import EditNoteIcon from "@mui/icons-material/EditNote";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area, Line
} from "recharts";

const API = "http://localhost:5000";

// ── Authenticated fetch helper ─────────────────────────────────────────────
const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem("foliox_token") || localStorage.getItem("wt_token");
  const isFormData = options.body instanceof FormData;
  return fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};
const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316","#a855f7"];

// ── Design tokens — light & dark ──────────────────────────────────────────
const makeTokens = (dark) => ({
  c: {
    primary: "#0066FF",
    gain:    "#00B386",
    loss:    "#E5483A",
    text1:   dark ? "#F1F5F9"  : "#1A1A2E",
    text2:   dark ? "#94A3B8"  : "#6B7280",
    text3:   dark ? "#64748B"  : "#9CA3AF",
    border:  dark ? "#1E293B"  : "#F0F0F0",
    bg:      dark ? "#0F172A"  : "#F7F8FA",
    card:    dark ? "#1E293B"  : "#FFFFFF",
    tag:     dark ? "#334155"  : "#F5F5F5",
    topbar:  dark ? "#1E293B"  : "#FFFFFF",
    input:   dark ? "#334155"  : "#FFFFFF",
  },
  shadow: {
    card:  dark ? "0 1px 3px rgba(0,0,0,0.4)"  : "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    hover: dark ? "0 4px 12px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.10)",
    hero:  "0 8px 32px rgba(0,102,255,0.18)",
    fab:   "0 4px 16px rgba(0,102,255,0.35)",
  },
  radius: { card:"12px", chip:"6px", fab:"14px" },
  grad: {
    primary: "linear-gradient(135deg, #0066FF 0%, #0052CC 100%)",
    dark:    "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
    success: "linear-gradient(135deg, #00B386 0%, #00966E 100%)",
  },
});
// T computed inside App per render
const SECTORS = ["IT","Banking","Pharma","Auto","FMCG","Energy","Metals","Realty","Infrastructure","Telecom","Finance","Unknown"];

const formatINR = (val) => {
  const n = Number(val) || 0;
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(2)}L`;
  if (n >= 1000)     return `₹${(n/1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};

const NOTIF_COLORS = {
  drift:     { bg:"#fffbeb", border:"#fde68a", color:"#92400e" },
  milestone: { bg:"#f0fdf4", border:"#bbf7d0", color:"#166534" },
  pl_alert:  { bg:"#eff6ff", border:"#bfdbfe", color:"#1e40af" },
  weekly:    { bg:"#f5f3ff", border:"#ddd6fe", color:"#5b21b6" },
};

// ── Login Page ─────────────────────────────────────────────────────────────
function LoginPage() {
  return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"#F7F8FA" }}>
      <Card sx={{ borderRadius:"20px", maxWidth:400, width:"90%", textAlign:"center",
        boxShadow:"0 8px 40px rgba(0,0,0,0.10)", border:"1px solid #F0F0F0" }}>
        <CardContent sx={{ p:4 }}>
          <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", gap:1.5, mb:3 }}>
            <Box sx={{ width:44, height:44, borderRadius:"12px", bgcolor:"#0066FF",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Typography sx={{ color:"white", fontWeight:900, fontSize:20 }}>F</Typography>
            </Box>
            <Typography sx={{ fontSize:26, fontWeight:800, color:"#1A1A2E", letterSpacing:"-1px" }}>
              Folio<Box component="span" sx={{ color:"#0066FF" }}>X</Box>
            </Typography>
          </Box>
          <Typography sx={{ fontSize:14, color:"#6B7280", mb:3.5 }}>
            Your personal portfolio & net worth tracker
          </Typography>
          {[
            { icon:"📈", text:"Real-time stock & net worth tracking" },
            { icon:"🏭", text:"Sector allocation & drift alerts" },
            { icon:"💰", text:"Dividend tracker & P&L analytics" },
            { icon:"🤖", text:"AI Portfolio Advisor" },
          ].map((f,i) => (
            <Box key={i} sx={{ display:"flex", alignItems:"center", gap:1.5, mb:1.2, textAlign:"left" }}>
              <Typography sx={{ fontSize:16 }}>{f.icon}</Typography>
              <Typography sx={{ fontSize:13, color:"#1A1A2E" }}>{f.text}</Typography>
            </Box>
          ))}
          <Button fullWidth variant="contained" size="large"
            startIcon={<GoogleIcon />}
            onClick={() => { window.location.href = `${API}/auth/google`; }}
            sx={{ mt:3, py:1.5, borderRadius:"12px", textTransform:"none",
              bgcolor:"white", color:"#1A1A2E", fontWeight:700, fontSize:15,
              border:"1px solid #E5E7EB", boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
              "&:hover":{ bgcolor:"#F9FAFB", boxShadow:"0 4px 16px rgba(0,0,0,0.12)" } }}>
            Continue with Google
          </Button>
          <Typography sx={{ fontSize:11, color:"#9CA3AF", mt:2 }}>
            🔒 Your data is private and secure
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

// ── Onboarding Page ───────────────────────────────────────────────────────
function OnboardingPage({ token, user, onComplete }) {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [milestone, setMilestone] = useState("100000");
  const [plAlert, setPlAlert] = useState("5");

  const MILESTONES = [
    { label:"₹50K", value:"50000" },  { label:"₹1L",  value:"100000" },
    { label:"₹5L",  value:"500000" }, { label:"₹10L", value:"1000000" },
    { label:"₹50L", value:"5000000" },{ label:"₹1Cr", value:"10000000" },
  ];

  const milestoneLabel = (v) => {
    const n = Number(v);
    if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`;
    if (n >= 100000)   return `₹${(n/100000).toFixed(0)}L`;
    if (n >= 1000)     return `₹${(n/1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  const handleFinish = async () => {
    try {
      await apiFetch(`${API}/auth/complete-onboarding`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ token, networth_milestone:Number(milestone), pl_alert_pct:Number(plAlert), phone })
      });
      onComplete();
    } catch (err) { console.error("Onboarding error:", err); }
  };

  return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
      <Card sx={{ borderRadius:4, maxWidth:460, width:"90%", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <CardContent sx={{ p:4 }}>
          {/* Step indicators */}
          <Box sx={{ display:"flex", justifyContent:"center", gap:1, mb:4, alignItems:"center" }}>
            {["Welcome","Alert Settings","Ready!"].map((s,i) => (
              <Box key={i} sx={{ display:"flex", alignItems:"center", gap:1 }}>
                <Box sx={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center",
                  justifyContent:"center", fontWeight:700, fontSize:13,
                  bgcolor:step>=i?"#6366f1":"#e5e7eb", color:step>=i?"white":"#9ca3af" }}>{i+1}</Box>
                <Typography variant="caption" sx={{ color:step>=i?"#6366f1":"#9ca3af", fontWeight:600 }}>{s}</Typography>
                {i < 2 && <Box sx={{ width:20, height:2, bgcolor:step>i?"#6366f1":"#e5e7eb" }} />}
              </Box>
            ))}
          </Box>

          {/* Step 0 */}
          {step === 0 && (
            <Box sx={{ textAlign:"center" }}>
              {user?.avatar
                ? <Box component="img" src={user.avatar} alt="avatar"
                    sx={{ width:80, height:80, borderRadius:"50%", mb:2, mx:"auto", display:"block", border:"3px solid #6366f1" }} />
                : <Avatar sx={{ bgcolor:"#6366f1", width:80, height:80, mx:"auto", mb:2, fontSize:36, fontWeight:800 }}>
                    {user?.name?.charAt(0)?.toUpperCase()||"W"}
                  </Avatar>
              }
              <Typography variant="h5" fontWeight={800} sx={{ color:"#6366f1", mb:1 }}>
                Welcome, {user?.name?.split(" ")[0]}! 👋
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>
                Let's set up your FolioX account in just 2 steps.
              </Typography>
              <Box sx={{ bgcolor:"#f5f3ff", borderRadius:2, p:2, mb:3, textAlign:"left" }}>
                <Typography variant="body2" fontWeight={600} sx={{ color:"#6366f1" }}>✅ Signed in as</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Button fullWidth variant="contained" size="large" onClick={() => setStep(1)}
                sx={{ bgcolor:"#6366f1", borderRadius:3, fontWeight:700, py:1.5, "&:hover":{ bgcolor:"#4f46e5" } }}>
                Let's Get Started →
              </Button>
            </Box>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb:0.5 }}>🔔 Set Your Alerts</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>
                We'll notify you when these thresholds are crossed.
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb:1 }}>🎯 Net Worth Milestone</Typography>
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:1, mb:2 }}>
                {MILESTONES.map(m => (
                  <Chip key={m.value} label={m.label} onClick={() => setMilestone(m.value)}
                    sx={{ cursor:"pointer", fontWeight:600,
                      bgcolor:milestone===m.value?"#6366f1":"#f3f4f6",
                      color:milestone===m.value?"white":"#374151" }} />
                ))}
              </Box>
              <TextField label="Custom amount (₹)" type="number" fullWidth sx={{ mb:3 }}
                value={milestone} onChange={e => setMilestone(e.target.value)}
                helperText="Notify me when my net worth crosses this amount" />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb:1 }}>📊 P&L Alert Threshold</Typography>
              <Box sx={{ display:"flex", gap:1, mb:2, flexWrap:"wrap" }}>
                {["1","2","5","10","15","20"].map(v => (
                  <Chip key={v} label={`${v}%`} onClick={() => setPlAlert(v)}
                    sx={{ cursor:"pointer", fontWeight:600,
                      bgcolor:plAlert===v?"#6366f1":"#f3f4f6",
                      color:plAlert===v?"white":"#374151" }} />
                ))}
              </Box>
              <TextField label="Phone (optional)" fullWidth sx={{ mb:3 }}
                value={phone} onChange={e => setPhone(e.target.value)}
                helperText="For future SMS alerts (optional)" />
              <Box sx={{ display:"flex", gap:2 }}>
                <Button fullWidth variant="outlined" onClick={() => setStep(0)}
                  sx={{ borderColor:"#6366f1", color:"#6366f1", borderRadius:3, fontWeight:700 }}>Back</Button>
                <Button fullWidth variant="contained" onClick={() => setStep(2)}
                  sx={{ bgcolor:"#6366f1", borderRadius:3, fontWeight:700, "&:hover":{ bgcolor:"#4f46e5" } }}>
                  Next →
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <Box sx={{ textAlign:"center" }}>
              <Typography fontSize={64} sx={{ mb:1 }}>🎉</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color:"#6366f1", mb:1 }}>You're all set!</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb:3 }}>Here's your setup summary:</Typography>
              <Box sx={{ textAlign:"left", mb:3 }}>
                {[
                  { icon:"🎯", label:"Net Worth Milestone", value:milestoneLabel(milestone) },
                  { icon:"📊", label:"P&L Alert",           value:`${plAlert}% gain/loss` },
                  { icon:"📋", label:"Weekly Digest",       value:"Every Monday 9AM" },
                  { icon:"⚠️", label:"Drift Alerts",        value:"Daily after market close" },
                ].map((item,i) => (
                  <Box key={i} sx={{ display:"flex", justifyContent:"space-between",
                    bgcolor:"#F7F8FA", borderRadius:2, p:1.5, mb:1 }}>
                    <Typography variant="body2">{item.icon} {item.label}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color:"#6366f1" }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display:"flex", gap:2 }}>
                <Button fullWidth variant="outlined" onClick={() => setStep(1)}
                  sx={{ borderColor:"#6366f1", color:"#6366f1", borderRadius:3, fontWeight:700 }}>Back</Button>
                <Button fullWidth variant="contained" size="large" onClick={handleFinish}
                  sx={{ bgcolor:"#6366f1", borderRadius:3, fontWeight:700, py:1.5, "&:hover":{ bgcolor:"#4f46e5" } }}>
                  🚀 Enter FolioX
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {

  // Auth
  const [authState, setAuthState]   = useState("loading");
  const [authToken, setAuthToken]   = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const token     = params.get("token");
    const onboarded = params.get("onboarded");

    if (token) {
      localStorage.setItem("foliox_token", token);
      localStorage.setItem("wt_token", token);
      window.history.replaceState({}, "", "/");
      apiFetch(`${API}/auth/me`, { headers:{ Authorization:`Bearer ${token}` } })
        .then(r => r.json()).then(user => {
          setCurrentUser(user); setAuthToken(token);
          setAuthState(onboarded === "false" ? "onboarding" : "app");
        }).catch(() => setAuthState("login"));
      return;
    }
    const saved = localStorage.getItem("wt_token");
    if (saved) {
      apiFetch(`${API}/auth/me`, { headers:{ Authorization:`Bearer ${saved}` } })
        .then(r => { if (r.ok) return r.json(); throw new Error("bad"); })
        .then(user => {
          setCurrentUser(user); setAuthToken(saved);
          setAuthState(user.is_onboarded ? "app" : "onboarding");
        }).catch(() => { localStorage.removeItem("wt_token"); setAuthState("login"); });
    } else {
      setAuthState("login");
    localStorage.removeItem("foliox_token");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("wt_token");
    setAuthState("login"); setAuthToken(null); setCurrentUser(null);
  };

  // Portfolio data
  const [assets, setAssets]           = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [selectMode, setSelectMode]     = useState(false);
  const [liabilities, setLiabilities] = useState([]);
  const [networth, setNetworth]       = useState({ totalAssets:0, totalLiabilities:0, netWorth:0 });
  const [open, setOpen]               = useState(false);
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [loading, setLoading]         = useState(false);
  const [snack, setSnack]             = useState({ open:false, msg:"", severity:"success" });
  const [exportAnchor, setExportAnchor] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [notifOpen, setNotifOpen]         = useState(false);

  // Profile
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile]         = useState({ name:"", email:"", phone:"", networth_milestone:1000000, pl_alert_pct:5 });
  const [profileEdit, setProfileEdit] = useState({ name:"", email:"", phone:"", networth_milestone:"", pl_alert_pct:"" });

  // Analytics
  const [history, setHistory]         = useState([]);
  const [historyDays, setHistoryDays] = useState(30);
  const [sectors, setSectors]         = useState([]);
  const [dividends, setDividends]     = useState([]);
  const [divOpen, setDivOpen]         = useState(false);
  const [divAssetId, setDivAssetId]   = useState("");
  const [divAmount, setDivAmount]     = useState("");
  const [divDate, setDivDate]         = useState(new Date().toISOString().split("T")[0]);
  const [divNotes, setDivNotes]       = useState("");
  const [targetOpen, setTargetOpen]   = useState(false);
  const [targetAsset, setTargetAsset] = useState(null);
  const [targetPct, setTargetPct]     = useState("");
  const [sectorEditAsset, setSectorEditAsset] = useState(null);
  const [sectorEditVal, setSectorEditVal]     = useState("");
  const [sectorOpen, setSectorOpen]           = useState(false);

  // Cash holdings
  const [cashHoldings, setCashHoldings]   = useState([]);
  const [cashSummary, setCashSummary]     = useState({ liquid:{total:0,target:0}, emergency:{total:0,target:0} });
  const [cashOpen, setCashOpen]           = useState(false);
  const [cashEditMode, setCashEditMode]   = useState(false);
  const [cashEditId, setCashEditId]       = useState(null);
  const [cashName, setCashName]           = useState("");
  const [cashCategory, setCashCategory]   = useState("liquid");
  const [cashAmount, setCashAmount]       = useState("");
  const [cashTarget, setCashTarget]       = useState("");
  const [cashNotes, setCashNotes]         = useState("");

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("foliox_dark") === "true");
  const T = makeTokens(darkMode);
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("foliox_dark", String(next));
  };

  // Bulk edit
  const [bulkEditOpen, setBulkEditOpen]   = useState(false);
  const [bulkField, setBulkField]         = useState("sector");
  const [bulkValue, setBulkValue]         = useState("");

  const handleBulkEdit = async () => {
    if (!bulkValue || selectedAssets.length === 0) return showSnack("Select assets and a value","error");
    try {
      await Promise.all(selectedAssets.map(id => {
        const endpoint = bulkField === "sector"
          ? apiFetch(`${API}/assets/${id}/sector`, { method:"PATCH", body:JSON.stringify({ sector:bulkValue }) })
          : apiFetch(`${API}/assets/${id}/target`, { method:"PATCH", body:JSON.stringify({ target_pct:Number(bulkValue) }) });
        return endpoint;
      }));
      showSnack(`✅ Updated ${selectedAssets.length} assets`);
      setBulkEditOpen(false); setBulkValue("");
      setSelectedAssets([]); setSelectMode(false);
      fetchAll(); fetchAnalytics();
    } catch { showSnack("Bulk update failed","error"); }
  };

  // CSV Export
  const handleCSVExport = () => {
    const totalAssets = assets.reduce((s,a) => s + Number(a.current_price)*Number(a.quantity), 0);
    const rows = [
      ["Name","Symbol","Type","Sector","Qty","Buy Price","Current Price","Invested","Current Value","P&L","P&L %","Allocation %","Target %"],
      ...assets.map(a => {
        const invested = Number(a.buy_price)*Number(a.quantity);
        const current  = Number(a.current_price)*Number(a.quantity);
        const pl       = current - invested;
        const plPct    = invested > 0 ? ((pl/invested)*100).toFixed(2) : "0";
        const alloc    = totalAssets > 0 ? ((current/totalAssets)*100).toFixed(2) : "0";
        return [
          a.name, a.symbol||"", a.type||"Equity", a.sector||"Unknown",
          a.quantity, a.buy_price, a.current_price,
          invested.toFixed(2), current.toFixed(2),
          pl.toFixed(2), plPct, alloc, a.target_pct||0
        ];
      }),
      [],
      ["SUMMARY"],
      ["Total Invested", assets.reduce((s,a)=>s+Number(a.buy_price)*Number(a.quantity),0).toFixed(2)],
      ["Total Value",    totalAssets.toFixed(2)],
      ["Total P&L",      (totalAssets - assets.reduce((s,a)=>s+Number(a.buy_price)*Number(a.quantity),0)).toFixed(2)],
      ["Liabilities",    liabilities.reduce((s,l)=>s+Number(l.amount),0).toFixed(2)],
      ["Net Worth",      (totalAssets - liabilities.reduce((s,l)=>s+Number(l.amount),0)).toFixed(2)],
      [],
      ["Exported on", new Date().toLocaleString("en-IN")],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `FolioX_Portfolio_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    showSnack("📥 CSV exported!");
  };

  // AI Advisor
  const [aiOpen, setAiOpen]               = useState(false);
  const [chatMessages, setChatMessages]   = useState([]);
  const [chatInput, setChatInput]         = useState("");
  const [chatLoading, setChatLoading]     = useState(false);
  const [quickInsights, setQuickInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Form
  const [editMode, setEditMode]       = useState(false);
  const [editId, setEditId]           = useState(null);
  const [editItemType, setEditItemType] = useState("asset");
  const [type, setType]               = useState("asset");
  const [assetType, setAssetType]     = useState("Equity"); // Equity | Gold | Cash | FD | MutualFund | Other
  const [name, setName]               = useState("");
  const [value, setValue]             = useState("");
  const [interest, setInterest]       = useState("");
  const [tenure, setTenure]           = useState("");
  const [buyPrice, setBuyPrice]       = useState("");
  const [quantity, setQuantity]       = useState("");
  const [symbol, setSymbol]           = useState("");
  const [symbolSearch, setSymbolSearch]         = useState("");
  const [symbolSuggestions, setSymbolSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions]   = useState(false);

  const fileInputRef = useRef(null);

  // PWA install prompt
  const [pwaInstallable, setPwaInstallable] = useState(false);
  useEffect(() => {
    const handler = () => setPwaInstallable(true);
    window.addEventListener("pwa-installable", handler);
    return () => window.removeEventListener("pwa-installable", handler);
  }, []);

  useEffect(() => {
    if (authState === "app") { fetchAll(); fetchUnreadCount(); fetchProfile(); fetchCash(); }
  }, [authState]);

  useEffect(() => {
    if (activeTab === "analytics" && authState === "app") fetchAnalytics();
  }, [activeTab, historyDays]);

  useEffect(() => {
    if (aiOpen && quickInsights.length === 0) fetchQuickInsights();
  }, [aiOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [chatMessages]);

  // ── Data fetchers ──────────────────────────────────────────────────────
  const fetchCash = async () => {
    try {
      const h = await apiFetch(`${API}/cash`).then(r => r.json());
      const holdings = Array.isArray(h) ? h : [];
      setCashHoldings(holdings);
      // Compute summary locally from holdings
      const liquid    = holdings.filter(x => x.category === "liquid");
      const emergency = holdings.filter(x => x.category === "emergency");
      setCashSummary({
        liquid:    { total: liquid.reduce((s,x)=>s+Number(x.amount),0),    target: liquid.reduce((s,x)=>s+Number(x.target_amount||0),0) },
        emergency: { total: emergency.reduce((s,x)=>s+Number(x.amount),0), target: emergency.reduce((s,x)=>s+Number(x.target_amount||0),0) },
      });
    } catch(e) { console.error("fetchCash error", e); }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, l] = await Promise.all([
        apiFetch(`${API}/assets`).then(r => r.json()),
        apiFetch(`${API}/liabilities`).then(r => r.json()),
      ]);
      const aArr = Array.isArray(a) ? a : [];
      const lArr = Array.isArray(l) ? l : [];
      setAssets(aArr); setLiabilities(lArr);
      const totalAssets      = aArr.reduce((s,x) => s + x.current_price * x.quantity, 0);
      const totalLiabilities = lArr.reduce((s,x) => s + Number(x.amount), 0);
      setNetworth({ totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities });
    } catch { showSnack("Failed to fetch data","error"); }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const [h, s, d] = await Promise.all([
        apiFetch(`${API}/analytics/networth-history?days=${historyDays}`).then(r => r.json()),
        apiFetch(`${API}/analytics/sector-data`).then(r => r.json()),
        apiFetch(`${API}/analytics/dividend-data`).then(r => r.json()),
      ]);
      setHistory(Array.isArray(h) ? h : []);
      setSectors(Array.isArray(s) ? s : []);
      setDividends(Array.isArray(d) ? d : []);
    } catch { showSnack("Failed to fetch analytics","error"); }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await apiFetch(`${API}/analytics/notifications/unread-count`);
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch(`${API}/analytics/notifications`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
      fetchUnreadCount();
    } catch {}
  };

  const fetchProfile = async () => {
    try {
      const res = await apiFetch(`${API}/profile`);
      const data = await res.json();
      setProfile(data);
      setProfileEdit({ name:data.name||"", email:data.email||"", phone:data.phone||"",
        networth_milestone:data.networth_milestone||1000000, pl_alert_pct:data.pl_alert_pct||5 });
    } catch {}
  };

  const fetchQuickInsights = async () => {
    setInsightsLoading(true);
    try {
      const res  = await apiFetch(`${API}/advisor/quick-insights`);
      const data = await res.json();
      setQuickInsights(data.insights || []);
    } catch {}
    setInsightsLoading(false);
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      await apiFetch(`${API}/notifications/profile`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(profileEdit)
      });
      setProfile({ ...profile, ...profileEdit });
      showSnack("Profile saved!"); setProfileOpen(false);
    } catch { showSnack("Failed to save profile","error"); }
  };

  const showSnack = (msg, severity="success") => setSnack({ open:true, msg, severity });

  const resetForm = () => {
    setName(""); setValue(""); setBuyPrice(""); setQuantity("");
    setSymbol(""); setSymbolSearch(""); setSymbolSuggestions([]);
    setShowSuggestions(false); setInterest(""); setTenure("");
    setAssetType("Equity");
    setEditMode(false); setEditId(null);
  };

  const handleZerodhaImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append("file", file);
    try {
      showSnack("Importing holdings...", "info");
      const res  = await apiFetch(`${API}/assets/import-zerodha`, { method:"POST", body:formData });
      const data = await res.json();
      if (data.imported !== undefined) {
        showSnack(`✅ Imported ${data.imported} holdings! (${data.skipped} skipped)`, "success");
        fetchAll();
      } else showSnack(data.error || "Import failed", "error");
    } catch { showSnack("Import failed", "error"); }
    e.target.value = "";
  };

  const handleOpen = (mode="add", item=null, itemType="asset") => {
    resetForm();
    if (mode === "edit" && item) {
      setEditMode(true); setEditId(item.id); setEditItemType(itemType); setType(itemType);
      setName(item.name||"");
      if (itemType === "asset") {
        setBuyPrice(item.buy_price||""); setQuantity(item.quantity||"");
        setSymbol(item.symbol||""); setSymbolSearch(item.symbol||"");
        setAssetType(item.type||"Equity");
      } else {
        setValue(item.amount||""); setInterest(item.interest||""); setTenure(item.tenure||"");
      }
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name) return showSnack("Name is required","error");
    try {
      if (editMode) {
        const url  = editItemType==="asset" ? `${API}/assets/${editId}` : `${API}/liabilities/${editId}`;
        const isStock = assetType === "Equity" || assetType === "MutualFund";
        const body = editItemType==="asset"
          ? { name, type:assetType, buy_price:Number(buyPrice), quantity: isStock ? Number(quantity) : 1, symbol: isStock ? symbol : "" }
          : { name, amount:Number(value), interest:Number(interest), tenure:Number(tenure) };
        await apiFetch(url, { method:"PUT", body:JSON.stringify(body) });
        showSnack("Updated successfully!");
      } else {
        if (type === "asset") {
          const isStock = assetType === "Equity" || assetType === "MutualFund";
          if (!buyPrice) return showSnack("Amount/price is required","error");
          if (isStock && !quantity) return showSnack("Quantity is required for stocks","error");
          await apiFetch(`${API}/assets`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
              name,
              type: assetType,
              buy_price: Number(buyPrice),
              quantity: isStock ? Number(quantity) : 1,
              symbol: isStock ? symbol : ""
            })
          });
        } else {
          await apiFetch(`${API}/liabilities`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({ name, amount:Number(value), interest:Number(interest), tenure:Number(tenure) })
          });
        }
        showSnack("Added successfully!");
      }
      resetForm(); setOpen(false); fetchAll();
    } catch { showSnack("Something went wrong","error"); }
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return;
    if (!window.confirm(`Delete ${selectedAssets.length} selected asset(s)?`)) return;
    await Promise.all(selectedAssets.map(id => apiFetch(`${API}/assets/${id}`, { method:"DELETE" })));
    showSnack(`Deleted ${selectedAssets.length} assets`);
    setSelectedAssets([]); setSelectMode(false); fetchAll();
  };

  const handleDelete = async (endpoint, id) => {
    await apiFetch(`${API}/${endpoint}/${id}`, { method:"DELETE" });
    showSnack("Deleted"); fetchAll();
  };

  const handleAddDividend = async () => {
    if (!divAssetId || !divAmount || !divDate) return showSnack("Fill all fields","error");
    try {
      await apiFetch(`${API}/dividends`, {
        method:"POST",
        body:JSON.stringify({ asset_name:divAssetId, amount:Number(divAmount), received_date:divDate, notes:divNotes })
      });
      showSnack("Dividend added!"); setDivOpen(false); setDivAssetId(""); setDivAmount(""); setDivNotes("");
      fetchAnalytics();
    } catch { showSnack("Failed to add dividend","error"); }
  };

  const handleUpdateTarget = async () => {
    if (!targetAsset) return;
    try {
      await apiFetch(`${API}/assets/${targetAsset.id}/target`, {
        method:"PATCH",
        body:JSON.stringify({ target_pct:Number(targetPct) })
      });
      showSnack("Target updated!"); setTargetOpen(false); fetchAll();
    } catch { showSnack("Failed to update target","error"); }
  };

  const handleUpdateSector = async () => {
    if (!sectorEditAsset) return;
    try {
      await apiFetch(`${API}/assets/${sectorEditAsset.id}/sector`, {
        method:"PATCH",
        body:JSON.stringify({ sector:sectorEditVal })
      });
      showSnack("Sector updated!"); setSectorOpen(false); fetchAll(); fetchAnalytics();
    } catch { showSnack("Failed to update sector","error"); }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg    = { role:"user", content:chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages); setChatInput(""); setChatLoading(true);
    try {
      const res  = await apiFetch(`${API}/advisor/chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role:"assistant", content: data.reply || data.error || "Sorry, try again." }]);
    } catch {
      setChatMessages(prev => [...prev, { role:"assistant", content:"Sorry, something went wrong. Please try again." }]);
    }
    setChatLoading(false);
  };

  const exportCSV = () => { handleCSVExport(); setExportAnchor(null); };

  const exportPDF = () => {
    const win = window.open("","_blank");
    const totalInvested = assets.reduce((s,a) => s + a.buy_price*a.quantity, 0);
    const totalGain     = networth.totalAssets - totalInvested;
    win.document.write(`<html><head><title>Portfolio Report</title><style>
      body{font-family:Arial;margin:40px;color:#111}h1{color:#6366f1}
      h2{color:#374151;border-bottom:2px solid #eee;padding-bottom:6px}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      th{background:#6366f1;color:white;padding:10px;text-align:left}
      td{padding:8px;border-bottom:1px solid #eee}
      .cards{display:flex;gap:16px;margin-bottom:28px}
      .card{background:#f5f3ff;border-radius:10px;padding:14px;flex:1;text-align:center}
      .card h3{margin:0;font-size:11px;color:#6b7280}
      .card p{margin:6px 0 0;font-size:20px;font-weight:800}
      .green{color:#10b981}.red{color:#ef4444}
    </style></head><body>
    <h1>📊 Portfolio Report</h1>
    <p style="color:#6b7280">Generated: ${new Date().toLocaleDateString("en-IN",{dateStyle:"long"})}</p>
    <div class="cards">
      <div class="card"><h3>NET WORTH</h3><p class="${networth.netWorth>=0?"green":"red"}">${formatINR(networth.netWorth)}</p></div>
      <div class="card"><h3>TOTAL ASSETS</h3><p class="green">${formatINR(networth.totalAssets)}</p></div>
      <div class="card"><h3>LIABILITIES</h3><p class="red">${formatINR(networth.totalLiabilities)}</p></div>
      <div class="card"><h3>TOTAL P&L</h3><p class="${totalGain>=0?"green":"red"}">${formatINR(totalGain)}</p></div>
    </div>
    <h2>Assets</h2>
    <table><tr><th>Name</th><th>Symbol</th><th>Sector</th><th>Buy Price</th><th>Qty</th><th>Value</th><th>P&L</th></tr>
    ${assets.map(a => {
      const cv=a.current_price*a.quantity, pl=cv-a.buy_price*a.quantity;
      return `<tr><td>${a.name}</td><td>${a.symbol||"-"}</td><td>${a.sector||"-"}</td><td>₹${a.buy_price}</td><td>${a.quantity}</td><td>₹${cv.toFixed(0)}</td><td style="color:${pl>=0?"#10b981":"#ef4444"}">${pl>=0?"+":""}₹${pl.toFixed(0)}</td></tr>`;
    }).join("")}
    </table>
    <h2>Liabilities</h2>
    <table><tr><th>Name</th><th>Amount</th><th>Rate</th><th>Tenure</th><th>EMI/mo</th></tr>
    ${liabilities.map(l => {
      const P=Number(l.amount),r=l.interest/12/100,n=l.tenure*12;
      const emi=(r&&n)?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):0;
      return `<tr><td>${l.name}</td><td>₹${l.amount}</td><td>${l.interest}%</td><td>${l.tenure}yr</td><td>₹${emi.toFixed(0)}</td></tr>`;
    }).join("")}
    </table></body></html>`);
    win.document.close(); win.print();
    showSnack("PDF ready!"); setExportAnchor(null);
  };

  // ── Computed values ────────────────────────────────────────────────────
  const debtRatio     = networth.totalAssets > 0 ? ((networth.totalLiabilities/networth.totalAssets)*100).toFixed(1) : 0;
  const totalInvested = assets.reduce((s,a) => s + a.buy_price*a.quantity, 0);
  const totalGain     = networth.totalAssets - totalInvested;
  const gainPct       = totalInvested > 0 ? ((totalGain/totalInvested)*100).toFixed(1) : 0;
  const totalDividends = dividends.reduce((s,d) => s + Number(d.amount), 0);

  // ── Auth screens ───────────────────────────────────────────────────────
  if (authState === "loading") return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
      <Box sx={{ textAlign:"center", color:"white" }}>
        <AccountBalanceWalletIcon sx={{ fontSize:60, mb:2 }} />
        <Typography variant="h5" fontWeight={900} sx={{ letterSpacing:-0.5 }}>
          <Box component="span" sx={{ color:T.c.text1 }}>Folio</Box>
          <Box component="span" sx={{ color:"#6366f1" }}>X</Box>
        </Typography>
        <LinearProgress sx={{ mt:2, width:200, mx:"auto", borderRadius:2,
          bgcolor:"rgba(255,255,255,0.2)", "& .MuiLinearProgress-bar":{ bgcolor:"white" } }} />
      </Box>
    </Box>
  );

  if (authState === "login") return <LoginPage />;

  if (authState === "onboarding") return (
    <OnboardingPage token={authToken} user={currentUser} onComplete={() => {
      fetchAll(); fetchUnreadCount(); fetchProfile(); setAuthState("app");
    }} />
  );

  // ── Sub-components ─────────────────────────────────────────────────────
  const StatCard = ({ icon, label, value, sub, color=T.c.primary, bg="#EEF4FF" }) => (
    <Card sx={{ borderRadius:T.radius.card, border:`1px solid ${T.c.border}`,
      bgcolor:T.c.card, boxShadow:T.shadow.card,
      transition:"box-shadow 0.15s",
      "&:hover":{ boxShadow:T.shadow.hover } }}>
      <CardContent sx={{ p:2, "&:last-child":{ pb:2 } }}>
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Box sx={{ flex:1 }}>
            <Typography sx={{ fontSize:10, fontWeight:600, color:T.c.text3,
              textTransform:"uppercase", letterSpacing:"0.8px", mb:0.5 }}>{label}</Typography>
            <Typography sx={{ fontSize:18, fontWeight:700, color:T.c.text1, lineHeight:1.2 }}>{value}</Typography>
            {sub && <Typography sx={{ fontSize:11, color:T.c.text2, mt:0.3 }}>{sub}</Typography>}
          </Box>
          <Box sx={{ width:38, height:38, borderRadius:"10px", bgcolor:bg,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Box sx={{ color, "& svg":{ fontSize:18 } }}>{icon}</Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const AssetCard = ({ a }) => {
    const invested   = a.buy_price * a.quantity;
    const cv         = a.current_price * a.quantity;
    const profit     = cv - invested;
    const pct        = invested > 0 ? ((profit/invested)*100).toFixed(1) : 0;
    const ppct       = networth.totalAssets > 0 ? ((cv/networth.totalAssets)*100).toFixed(1) : 0;
    const drift      = a.target_pct > 0 ? (Number(ppct) - Number(a.target_pct)).toFixed(1) : null;
    const isSelected = selectedAssets.includes(a.id);
    const isProfit   = profit >= 0;
    const plColor    = isProfit ? T.c.gain : T.c.loss;
    const typeEmoji  = { Gold:"🥇", Cash:"💵", FD:"🏦", MutualFund:"📊", Equity:"📈", Other:"📦" };

    return (
      <Card
        onClick={selectMode ? () => setSelectedAssets(prev =>
          isSelected ? prev.filter(id=>id!==a.id) : [...prev,a.id]) : undefined}
        sx={{ mb:1.5, borderRadius:T.radius.card, bgcolor:T.c.card,
          border: isSelected ? `1.5px solid ${T.c.primary}` : `1px solid ${T.c.border}`,
          boxShadow: isSelected ? `0 0 0 3px rgba(0,102,255,0.08)` : T.shadow.card,
          cursor: selectMode?"pointer":"default",
          transition:"all 0.15s ease",
          "&:hover":{ boxShadow:T.shadow.hover } }}>
        <CardContent sx={{ p:0, "&:last-child":{ pb:0 } }}>

          {/* Main row */}
          <Box sx={{ px:2, py:1.8, display:"flex", alignItems:"center", gap:1.5 }}>

            {/* Checkbox */}
            {selectMode && (
              <Checkbox size="small" checked={isSelected}
                onChange={e => { e.stopPropagation(); setSelectedAssets(prev =>
                  e.target.checked ? [...prev,a.id] : prev.filter(id=>id!==a.id)); }}
                sx={{ p:0, flexShrink:0, color:T.c.primary, "&.Mui-checked":{ color:T.c.primary } }} />
            )}

            {/* Avatar */}
            <Box sx={{ width:40, height:40, borderRadius:"10px", flexShrink:0, bgcolor:"#F0F4FF",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Typography sx={{ fontSize:15 }}>{typeEmoji[a.type]||"📈"}</Typography>
            </Box>

            {/* Name + tags */}
            <Box sx={{ flex:1, minWidth:0 }}>
              <Typography sx={{ fontWeight:700, fontSize:14, color:T.c.text1, lineHeight:1.3,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {a.name}
              </Typography>
              <Box sx={{ display:"flex", gap:0.5, mt:0.4, alignItems:"center", flexWrap:"wrap" }}>
                {a.symbol && (
                  <Typography sx={{ fontSize:10, fontWeight:600, color:T.c.primary,
                    bgcolor:"#EEF4FF", px:0.7, py:0.1, borderRadius:"4px" }}>{a.symbol}</Typography>
                )}
                {a.sector && a.sector!=="Unknown" && (
                  <Typography sx={{ fontSize:10, color:T.c.text2,
                    bgcolor:T.c.tag, px:0.7, py:0.1, borderRadius:"4px" }}>{a.sector}</Typography>
                )}
              </Box>
            </Box>

            {/* Value + P&L */}
            <Box sx={{ textAlign:"right", flexShrink:0 }}>
              <Typography sx={{ fontWeight:700, fontSize:15, color:T.c.text1 }}>{formatINR(cv)}</Typography>
              <Typography sx={{ fontSize:12, fontWeight:600, color:plColor, mt:0.2 }}>
                {isProfit?"+":""}{pct}%
              </Typography>
            </Box>
          </Box>

          {/* Divider + stats */}
          <Box sx={{ borderTop:`1px solid ${T.c.border}`, mx:2, py:1.2,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Box sx={{ display:"flex", gap:3 }}>
              <Box>
                <Typography sx={{ fontSize:10, color:T.c.text3, mb:0.2 }}>Invested</Typography>
                <Typography sx={{ fontSize:12, fontWeight:600, color:T.c.text2 }}>{formatINR(invested)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize:10, color:T.c.text3, mb:0.2 }}>P&L</Typography>
                <Typography sx={{ fontSize:12, fontWeight:600, color:plColor }}>
                  {isProfit?"+":""}{formatINR(profit)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize:10, color:T.c.text3, mb:0.2 }}>Qty</Typography>
                <Typography sx={{ fontSize:12, fontWeight:600, color:T.c.text2 }}>{a.quantity}</Typography>
              </Box>
            </Box>

            {/* Action icons — compact */}
            {!selectMode && (
              <Box sx={{ display:"flex", gap:0.3 }}>
                {[
                  { tip:"Sector",  icon:<AccountBalanceIcon sx={{fontSize:13}}/>, fn:()=>{ setSectorEditAsset(a); setSectorEditVal(a.sector||"Unknown"); setSectorOpen(true); } },
                  { tip:"Target",  icon:<TrackChangesIcon sx={{fontSize:13}}/>,   fn:()=>{ setTargetAsset(a); setTargetPct(a.target_pct||""); setTargetOpen(true); } },
                  { tip:"Edit",    icon:<EditIcon sx={{fontSize:13}}/>,           fn:()=>handleOpen("edit",a,"asset") },
                  { tip:"Delete",  icon:<DeleteIcon sx={{fontSize:13}}/>,         fn:()=>handleDelete("assets",a.id), danger:true },
                ].map((btn,i) => (
                  <Tooltip key={i} title={btn.tip}>
                    <IconButton size="small" onClick={btn.fn}
                      sx={{ width:26, height:26, borderRadius:"6px",
                        color: btn.danger ? T.c.loss : T.c.text3,
                        "&:hover":{ bgcolor:btn.danger?"#FEF0EF":"#F0F4FF",
                          color:btn.danger?T.c.loss:T.c.primary } }}>
                      {btn.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            )}
          </Box>

          {/* Target progress — only if set */}
          {drift !== null && (
            <Box sx={{ px:2, pb:1.5 }}>
              <LinearProgress variant="determinate" value={Math.min(Number(ppct),100)}
                sx={{ borderRadius:4, height:3, bgcolor:T.c.border,
                  "& .MuiLinearProgress-bar":{ borderRadius:4, bgcolor:T.c.primary } }} />
              <Typography sx={{ fontSize:10, color:Math.abs(drift)>5?T.c.loss:T.c.text3, mt:0.4, fontWeight:500 }}>
                Target {a.target_pct}% · current {ppct}%
                {Math.abs(drift)>5 ? ` · ${drift>0?"▲":"▼"} ${Math.abs(drift)}% off` : " · ✓ on target"}
              </Typography>
            </Box>
          )}

        </CardContent>
      </Card>
    );
  };

  const LiabilityCard = ({ l }) => {
    const P=Number(l.amount), r=l.interest/12/100, n=l.tenure*12;
    const emi=(r&&n)?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):0;
    const totalInt = emi*n - P;
    const lpct = networth.totalLiabilities > 0 ? ((l.amount/networth.totalLiabilities)*100).toFixed(1) : 0;
    return (
      <Card sx={{ mb:1.5, borderRadius:T.radius.card, border:`1px solid ${T.c.border}`, bgcolor:T.c.card, boxShadow:T.shadow.card, "&:hover":{ boxShadow:T.shadow.hover } }}>
        <CardContent>
          <Box sx={{ display:"flex", justifyContent:"space-between" }}>
            <Box sx={{ flex:1 }}>
              <Typography fontWeight={700} sx={{ mb:0.5 }}>{l.name}</Typography>
              <Box sx={{ display:"flex", gap:1, mb:1 }}>
                <Chip label="Loan" size="small" sx={{ bgcolor:"#fef2f2", color:"#ef4444", fontWeight:600 }} />
                <Chip label={`${lpct}% of debt`} size="small" sx={{ bgcolor:T.c.tag }} />
              </Box>
              {l.interest > 0 && <Typography variant="body2" color="text.secondary">{l.interest}% p.a. · {l.tenure} yrs</Typography>}
              {emi > 0 && <>
                <Typography variant="body2" fontWeight={600} sx={{ mt:0.5 }}>EMI: {formatINR(emi)}/mo</Typography>
                <Typography variant="body2" color="text.secondary">Total Interest: {formatINR(totalInt)}</Typography>
              </>}
              <LinearProgress variant="determinate" value={Math.min(Number(lpct),100)}
                sx={{ mt:1.5, borderRadius:2, height:5, bgcolor:T.c.tag,
                  "& .MuiLinearProgress-bar":{ bgcolor:"#ef4444" } }} />
            </Box>
            <Box sx={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:1 }}>
              <Typography variant="h6" fontWeight={800} sx={{ color:"#ef4444" }}>{formatINR(l.amount)}</Typography>
              <Box>
                <IconButton size="small" onClick={() => handleOpen("edit",l,"liability")} sx={{ color:"#6366f1" }}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => handleDelete("liabilities",l.id)} sx={{ color:"#ef4444" }}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // ── Analytics Tab ──────────────────────────────────────────────────────
  const AnalyticsTab = () => {
    const totalDivThisYear = dividends
      .filter(d => new Date(d.received_date).getFullYear() === new Date().getFullYear())
      .reduce((s,d) => s + Number(d.amount), 0);
    const driftAlerts = assets.filter(a => {
      const target = Number(a.target_pct);
      if (!target || target === 0) return false;
      const actual = networth.totalAssets > 0 ? (a.current_price*a.quantity/networth.totalAssets)*100 : 0;
      return Math.abs(actual - target) > 5;
    });
    return (
      <>
        <Grid container spacing={1.5} sx={{ mb:2 }}>
          <Grid item xs={6}>
            <StatCard icon={<TrendingUpIcon />} label="TOTAL P&L" value={`${gainPct}%`}
              sub={formatINR(totalGain)} color={totalGain>=0?T.c.gain:T.c.loss} bg={totalGain>=0?"#E6F7F3":"#FEF0EF"} />
          </Grid>
          <Grid item xs={6}>
            <StatCard icon={<SavingsIcon />} label="DIVIDENDS" value={formatINR(totalDividends)}
              sub={`${formatINR(totalDivThisYear)} this year`} color="#7C3AED" bg="#F3EEFF" />
          </Grid>
        </Grid>

        {driftAlerts.length > 0 && (
          <Card sx={{ mb:2, borderRadius:T.radius.card, border:"1px solid #FDE68A", bgcolor:"#FFFBEB", boxShadow:T.shadow.card }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb:1.5, color:"#92400e" }}>⚠️ Allocation Drift Alerts</Typography>
              {driftAlerts.map((a,i) => {
                const actual = ((a.current_price*a.quantity/networth.totalAssets)*100).toFixed(1);
                const drift  = (actual - a.target_pct).toFixed(1);
                return (
                  <Box key={i} sx={{ display:"flex", justifyContent:"space-between", mb:1, alignItems:"center" }}>
                    <Typography variant="body2" fontWeight={600}>{a.name}</Typography>
                    <Box sx={{ textAlign:"right" }}>
                      <Typography variant="body2" color="text.secondary">Target: {a.target_pct}% · Actual: {actual}%</Typography>
                      <Chip label={`${drift>0?"Over":"Under"} by ${Math.abs(drift)}%`} size="small"
                        sx={{ bgcolor:drift>0?"#fee2e2":"#dbeafe", color:drift>0?"#ef4444":"#3b82f6", fontWeight:600 }} />
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Net Worth History */}
        <Card sx={{ mb:2, borderRadius:T.radius.card, boxShadow:T.shadow.card, border:`1px solid ${T.c.border}`, bgcolor:T.c.card }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
              <Typography sx={{ fontSize:14, fontWeight:700, color:T.c.text1 }}>Net Worth History</Typography>
              <Box sx={{ display:"flex", gap:1, alignItems:"center" }}>
                {[7,30,90,180].map(d => (
                  <Chip key={d} label={`${d}d`} size="small" onClick={() => setHistoryDays(d)}
                    sx={{ cursor:"pointer", fontWeight:600,
                      bgcolor:historyDays===d?"#6366f1":"#f3f4f6",
                      color:historyDays===d?"white":"#6b7280" }} />
                ))}
                <Tooltip title="Save snapshot">
                  <IconButton size="small" sx={{ bgcolor:"#f5f3ff", color:"#6366f1" }}
                    onClick={async () => {
                      await apiFetch(`${API}/analytics/snapshot`, { method:"POST" });
                      fetchAnalytics(); fetchAll(); showSnack("📸 Snapshot saved!");
                    }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            {history.length === 0 ? (
              <Box sx={{ textAlign:"center", py:4 }}>
                <Typography color="text.secondary" variant="body2">No history yet. Click 🔄 to save first snapshot.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={history.map(h => ({
                  date: new Date(h.recorded_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}),
                  "Net Worth":   +Number(h.net_worth).toFixed(0),
                  "Assets":      +Number(h.total_assets).toFixed(0),
                  "Invested":    +Number(h.total_invested||0).toFixed(0),
                  "Liabilities": +Number(h.total_liabilities||0).toFixed(0),
                }))}>
                  <defs>
                    <linearGradient id="networthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize:11 }} />
                  <YAxis tickFormatter={v => formatINR(v)} tick={{ fontSize:10 }} />
                  <ReTooltip formatter={v => formatINR(v)} contentStyle={{ borderRadius:10, fontSize:12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="Assets" stroke="#10b981" fill="url(#assetsGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Invested" stroke="#f59e0b" fill="url(#investedGrad)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                  <Area type="monotone" dataKey="Liabilities" stroke="#ef4444" fill="none" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="Net Worth" stroke="#6366f1" fill="url(#networthGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sector Allocation */}
        <Card sx={{ mb:3, borderRadius:3, bgcolor:T.c.card }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1 }}>
              <Typography variant="subtitle1" fontWeight={700}>🏭 Sector Allocation</Typography>
              <Button size="small" variant="outlined"
                sx={{ borderColor:"#6366f1", color:"#6366f1", fontWeight:600, borderRadius:2 }}
                onClick={async () => {
                  const res = await apiFetch(`${API}/analytics/auto-sector`, { method:"POST" });
                  const data = await res.json();
                  showSnack(data.message || "Sectors assigned!"); fetchAll();
                }}>⚡ Auto-Assign</Button>
            </Box>
            {sectors.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ py:2, textAlign:"center" }}>
                No sector data. Click ⚡ Auto-Assign or use 🏦 icon on each asset.
              </Typography>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={sectors.map(s => ({ name:s.sector, value:+Number(s.value).toFixed(0) }))}
                      dataKey="value" outerRadius={80} innerRadius={40} paddingAngle={2}>
                      {sectors.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <ReTooltip formatter={(v,n) => [formatINR(v),n]} contentStyle={{ borderRadius:10, fontSize:12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt:1 }}>
                  {sectors.map((s,i) => {
                    const pct = networth.totalAssets > 0 ? ((s.value/networth.totalAssets)*100).toFixed(1) : 0;
                    return (
                      <Box key={i} sx={{ display:"flex", alignItems:"center", gap:1, mb:1 }}>
                        <Box sx={{ width:10, height:10, borderRadius:"50%", bgcolor:COLORS[i%COLORS.length], flexShrink:0 }} />
                        <Typography variant="body2" sx={{ flex:1 }}>{s.sector}</Typography>
                        <Typography variant="body2" color="text.secondary">{s.stock_count} stocks</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color:COLORS[i%COLORS.length], minWidth:50, textAlign:"right" }}>{pct}%</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Target Allocation */}
        <Card sx={{ mb:3, borderRadius:3, bgcolor:T.c.card }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb:1.5 }}>🎯 Target vs Actual Allocation</Typography>
            {assets.filter(a => Number(a.target_pct) > 0).length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ py:2, textAlign:"center" }}>
                No targets set. Click 🎯 icon on each asset to set a target %.
              </Typography>
            ) : (
              assets.filter(a => Number(a.target_pct) > 0).map((a,i) => {
                const actual = networth.totalAssets > 0 ? ((a.current_price*a.quantity/networth.totalAssets)*100).toFixed(1) : 0;
                const drift  = (actual - a.target_pct).toFixed(1);
                return (
                  <Box key={i} sx={{ mb:2 }}>
                    <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.5 }}>
                      <Typography variant="body2" fontWeight={600}>{a.name}</Typography>
                      <Chip label={`${drift>0?"+":""}${drift}% drift`} size="small"
                        sx={{ fontSize:10, height:18,
                          bgcolor:Math.abs(drift)<=2?"#ecfdf5":Math.abs(drift)<=5?"#fffbeb":"#fef2f2",
                          color:Math.abs(drift)<=2?"#10b981":Math.abs(drift)<=5?"#f59e0b":"#ef4444", fontWeight:700 }} />
                    </Box>
                    <Box sx={{ display:"flex", gap:1, mb:0.5 }}>
                      <Typography variant="caption" color="text.secondary">Actual {actual}%</Typography>
                      <Typography variant="caption" color="text.secondary">·</Typography>
                      <Typography variant="caption" color="text.secondary">Target {a.target_pct}%</Typography>
                    </Box>
                    <Box sx={{ position:"relative", height:8, bgcolor:T.c.tag, borderRadius:4 }}>
                      <Box sx={{ position:"absolute", height:"100%", borderRadius:4, bgcolor:"#6366f1", width:`${Math.min(actual,100)}%` }} />
                      <Box sx={{ position:"absolute", top:"-3px", height:14, width:2, bgcolor:"#f59e0b", left:`${Math.min(a.target_pct,100)}%` }} />
                    </Box>
                  </Box>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Dividend Tracker */}
        <Card sx={{ mb:2, borderRadius:T.radius.card, boxShadow:T.shadow.card, border:`1px solid ${T.c.border}`, bgcolor:T.c.card }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
              <Typography sx={{ fontSize:14, fontWeight:700, color:T.c.text1 }}>Dividend Tracker</Typography>
              <Button size="small" variant="outlined" onClick={() => setDivOpen(true)}
                sx={{ borderColor:"#6366f1", color:"#6366f1", fontWeight:600, borderRadius:2 }}>+ Add</Button>
            </Box>
            {dividends.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ py:2, textAlign:"center" }}>No dividends logged yet.</Typography>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb:2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor:"#f5f3ff", borderRadius:2, p:1.5, textAlign:"center" }}>
                      <Typography variant="caption" color="text.secondary">All Time</Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ color:"#6366f1" }}>{formatINR(totalDividends)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor:"#ecfdf5", borderRadius:2, p:1.5, textAlign:"center" }}>
                      <Typography variant="caption" color="text.secondary">This Year</Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ color:"#10b981" }}>{formatINR(totalDivThisYear)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight:700, fontSize:12 }}>Stock</TableCell>
                      <TableCell sx={{ fontWeight:700, fontSize:12 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight:700, fontSize:12 }}>Date</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dividends.slice(0,10).map((d,i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ fontSize:12 }}>
                          <Typography variant="body2" fontWeight={600}>{d.asset_name}</Typography>
                          {d.notes && <Typography variant="caption" color="text.secondary">{d.notes}</Typography>}
                        </TableCell>
                        <TableCell sx={{ fontSize:12, color:"#10b981", fontWeight:700 }}>{formatINR(d.amount)}</TableCell>
                        <TableCell sx={{ fontSize:12 }}>{d.received_date?.slice(0,10)}</TableCell>
                        <TableCell>
                          <IconButton size="small" sx={{ color:"#ef4444" }}
                            onClick={async () => {
                              await apiFetch(`${API}/dividends/${d.id}`, { method:"DELETE" });
                              fetchAnalytics(); showSnack("Dividend deleted");
                            }}>
                            <DeleteIcon sx={{ fontSize:14 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  // ── AI Advisor Tab ─────────────────────────────────────────────────────
  const AdvisorTab = () => {
    const INSIGHT_STYLES = {
      positive: { bg:"#f0fdf4", border:"#bbf7d0", color:"#166534", icon:"✅" },
      warning:  { bg:"#fffbeb", border:"#fde68a", color:"#92400e", icon:"⚠️" },
      action:   { bg:"#eff6ff", border:"#bfdbfe", color:"#1e40af", icon:"🎯" },
      info:     { bg:"#f5f3ff", border:"#ddd6fe", color:"#5b21b6", icon:"💡" },
    };
    const SUGGESTED = [
      "How is my portfolio performing?",
      "Which stocks should I consider selling?",
      "Am I too concentrated in any sector?",
      "Should I rebalance my portfolio?",
      "What is dragging my returns?",
      "How diversified is my portfolio?",
    ];
    return (
      <>
        {/* Header */}
        <Card sx={{ mb:3, borderRadius:4, background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow:"0 8px 32px rgba(99,102,241,0.3)" }}>
          <CardContent sx={{ p:3 }}>
            <Box sx={{ display:"flex", alignItems:"center", gap:1.5, mb:1 }}>
              <Avatar sx={{ bgcolor:"rgba(255,255,255,0.2)", width:44, height:44 }}>
                <SmartToyIcon sx={{ color:"white" }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ color:"white" }}>AI Portfolio Advisor</Typography>
                <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.8)" }}>
                  Powered by Gemini · Knows your full portfolio
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color:"rgba(255,255,255,0.9)", mt:1 }}>
              Ask me anything about your investments — I have full access to your holdings, P&L, sector allocation, and drift alerts.
            </Typography>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card sx={{ mb:3, borderRadius:3, bgcolor:T.c.card }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
              <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                <LightbulbIcon sx={{ color:"#f59e0b", fontSize:20 }} />
                <Typography variant="subtitle1" fontWeight={700}>Quick Insights</Typography>
              </Box>
              <Button size="small" onClick={fetchQuickInsights} disabled={insightsLoading}
                startIcon={<AutoAwesomeIcon sx={{ fontSize:14 }} />}
                sx={{ color:"#6366f1", fontWeight:600, fontSize:11 }}>
                {insightsLoading ? "Analysing..." : "Refresh"}
              </Button>
            </Box>
            {insightsLoading ? (
              <Box>{[1,2,3,4].map(i => (
                <Box key={i} sx={{ mb:1.5, p:1.5, bgcolor:T.c.bg, borderRadius:2 }}>
                  <LinearProgress sx={{ borderRadius:2, mb:1 }} />
                  <LinearProgress sx={{ borderRadius:2, width:"60%" }} />
                </Box>
              ))}</Box>
            ) : quickInsights.length === 0 ? (
              <Box sx={{ textAlign:"center", py:3 }}>
                <Typography color="text.secondary" variant="body2">
                  Click "Refresh" to generate AI insights for your portfolio.
                </Typography>
              </Box>
            ) : (
              quickInsights.map((ins,i) => {
                const s = INSIGHT_STYLES[ins.type] || INSIGHT_STYLES.info;
                return (
                  <Box key={i} sx={{ mb:1.5, p:1.5, borderRadius:2, bgcolor:s.bg, border:`1px solid ${s.border}` }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color:s.color, mb:0.5 }}>
                      {s.icon} {ins.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color:s.color, opacity:0.85, lineHeight:1.5 }}>
                      {ins.message}
                    </Typography>
                  </Box>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Chat */}
        <Card sx={{ borderRadius:3, mb:3 }}>
          <CardContent sx={{ p:0 }}>
            <Box sx={{ p:2, borderBottom:`1px solid ${T.c.border}` }}>
              <Typography variant="subtitle1" fontWeight={700}>💬 Ask Your Advisor</Typography>
            </Box>
            <Box sx={{ height:380, overflowY:"auto", p:2 }}>
              {chatMessages.length === 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb:2, textAlign:"center" }}>
                    Try asking one of these:
                  </Typography>
                  <Box sx={{ display:"flex", flexWrap:"wrap", gap:1, justifyContent:"center" }}>
                    {SUGGESTED.map((q,i) => (
                      <Chip key={i} label={q} size="small" onClick={() => setChatInput(q)}
                        sx={{ cursor:"pointer", bgcolor:"#f5f3ff", color:"#6366f1",
                          fontWeight:600, fontSize:11, "&:hover":{ bgcolor:"#ede9fe" } }} />
                    ))}
                  </Box>
                </Box>
              ) : (
                <>
                  {chatMessages.map((msg,i) => (
                    <Box key={i} sx={{ mb:2, display:"flex",
                      justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
                      {msg.role === "assistant" && (
                        <Avatar sx={{ bgcolor:"#6366f1", width:28, height:28, mr:1, mt:0.5, flexShrink:0 }}>
                          <SmartToyIcon sx={{ fontSize:16 }} />
                        </Avatar>
                      )}
                      <Box sx={{ maxWidth:"80%", p:1.5, borderRadius:2,
                        bgcolor:msg.role==="user"?"#6366f1":"#f9fafb",
                        border:msg.role==="assistant"?"1px solid #e5e7eb":"none" }}>
                        <Typography variant="body2"
                          sx={{ color:msg.role==="user"?"white":"#111827", whiteSpace:"pre-wrap", lineHeight:1.6 }}>
                          {msg.content}
                        </Typography>
                      </Box>
                      {msg.role === "user" && (
                        <Avatar sx={{ bgcolor:"#e5e7eb", width:28, height:28, ml:1, mt:0.5, flexShrink:0 }}>
                          {currentUser?.avatar
                            ? <Box component="img" src={currentUser.avatar} sx={{ width:28, height:28, borderRadius:"50%" }} />
                            : <Typography sx={{ fontSize:12, fontWeight:700, color:T.c.text2 }}>
                                {currentUser?.name?.charAt(0)||"U"}
                              </Typography>
                          }
                        </Avatar>
                      )}
                    </Box>
                  ))}
                  {chatLoading && (
                    <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:2 }}>
                      <Avatar sx={{ bgcolor:"#6366f1", width:28, height:28 }}>
                        <SmartToyIcon sx={{ fontSize:16 }} />
                      </Avatar>
                      <Box sx={{ p:1.5, bgcolor:T.c.bg, border:"1px solid #e5e7eb", borderRadius:2 }}>
                        <Box sx={{ display:"flex", gap:0.5, alignItems:"center" }}>
                          {[0,1,2].map(i => (
                            <Box key={i} sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#6366f1",
                              animation:"bounce 1.2s infinite", animationDelay:`${i*0.2}s`,
                              "@keyframes bounce":{
                                "0%,80%,100%":{ transform:"scale(0.6)", opacity:0.4 },
                                "40%":{ transform:"scale(1)", opacity:1 }
                              }}} />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </Box>
            <Box sx={{ p:2, borderTop:`1px solid ${T.c.border}`, display:"flex", gap:1 }}>
              <TextField fullWidth size="small" placeholder="Ask about your portfolio..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendChatMessage(); }}}
                sx={{ "& .MuiOutlinedInput-root":{ borderRadius:3 } }} />
              <IconButton onClick={sendChatMessage} disabled={!chatInput.trim()||chatLoading}
                sx={{ bgcolor:"#6366f1", color:"white", borderRadius:2, px:2,
                  "&:hover":{ bgcolor:"#4f46e5" },
                  "&:disabled":{ bgcolor:"#e5e7eb", color:T.c.text3 } }}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
            {chatMessages.length > 0 && (
              <Box sx={{ px:2, pb:1.5 }}>
                <Button size="small" onClick={() => setChatMessages([])}
                  sx={{ color:T.c.text3, fontSize:11 }}>Clear conversation</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </>
    );
  };


  // ── Cash handlers (App level to prevent re-render flicker) ──────────────
  const openCashAdd = (cat) => {
    setCashEditMode(false); setCashEditId(null);
    setCashName(""); setCashAmount(""); setCashTarget(""); setCashNotes(""); setCashCategory(cat);
    setCashOpen(true);
  };
  const openCashEdit = (c) => {
    setCashEditMode(true); setCashEditId(c.id);
    setCashName(c.name); setCashAmount(String(c.amount)); setCashTarget(String(c.target_amount||""));
    setCashNotes(c.notes||""); setCashCategory(c.category);
    setCashOpen(true);
  };
  const handleSaveCash = async () => {
    if (!cashName || !cashAmount) return showSnack("Name and amount required","error");
    try {
      const url    = cashEditMode ? `${API}/cash/${cashEditId}` : `${API}/cash`;
      const method = cashEditMode ? "PUT" : "POST";
      await apiFetch(url, { method,
        body:JSON.stringify({ name:cashName, category:cashCategory, amount:Number(cashAmount), target_amount:Number(cashTarget)||0, notes:cashNotes }) });
      showSnack(cashEditMode ? "Updated!" : "Added!"); setCashOpen(false); fetchCash();
    } catch { showSnack("Failed","error"); }
  };
  const handleDeleteCash = async (id) => {
    await apiFetch(`${API}/cash/${id}`, { method:"DELETE" });
    showSnack("Deleted"); fetchCash();
  };

  // ── Cash & Emergency Fund Tab ──────────────────────────────────────────
  const CashTab = () => {
    const totalLiquid    = cashSummary.liquid.total;
    const targetLiquid   = cashSummary.liquid.target;
    const totalEmergency = cashSummary.emergency.total;
    const targetEmergency= cashSummary.emergency.target;
    const liquidPct      = targetLiquid   > 0 ? Math.min((totalLiquid/targetLiquid)*100,100)   : 0;
    const emergencyPct   = targetEmergency> 0 ? Math.min((totalEmergency/targetEmergency)*100,100) : 0;
    const liquid    = cashHoldings.filter(c => c.category === "liquid");
    const emergency = cashHoldings.filter(c => c.category === "emergency");

    const CashCard = ({ item }) => (
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        p:1.5, mb:1, borderRadius:2, bgcolor:T.c.bg, border:"1px solid #e5e7eb" }}>
        <Box>
          <Typography variant="body2" fontWeight={700}>{item.name}</Typography>
          {item.notes && <Typography variant="caption" color="text.secondary">{item.notes}</Typography>}
        </Box>
        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
          <Typography variant="body2" fontWeight={800} sx={{ color:"#10b981" }}>{formatINR(item.amount)}</Typography>
          <IconButton size="small" onClick={() => openCashEdit(item)} sx={{ color:"#6366f1" }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => handleDeleteCash(item.id)} sx={{ color:"#ef4444" }}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      </Box>
    );

    return (
      <>
        {/* Header */}
        <Card sx={{ mb:3, borderRadius:4, background:"linear-gradient(135deg,#10b981,#059669)",
          boxShadow:"0 8px 32px rgba(16,185,129,0.3)" }}>
          <CardContent sx={{ p:3 }}>
            <Typography sx={{ color:"rgba(255,255,255,0.8)", fontWeight:600, fontSize:12, letterSpacing:1 }}>
              TOTAL CASH RESERVES
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color:"white", mt:0.5 }}>
              {formatINR(totalLiquid + totalEmergency)}
            </Typography>
            <Box sx={{ display:"flex", gap:1, mt:1.5, flexWrap:"wrap" }}>
              <Chip label={`💵 Liquid: ${formatINR(totalLiquid)}`} size="small"
                sx={{ bgcolor:"rgba(255,255,255,0.2)", color:"white", fontWeight:600 }} />
              <Chip label={`🛡️ Emergency: ${formatINR(totalEmergency)}`} size="small"
                sx={{ bgcolor:"rgba(255,255,255,0.2)", color:"white", fontWeight:600 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Liquid Cash */}
        <Card sx={{ mb:3, borderRadius:3, border:"1px solid #d1fae5" }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1.5 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color:"#065f46" }}>
                  💵 Liquid Cash
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  For market crashes & opportunities
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => openCashAdd("liquid")}
                sx={{ borderColor:"#10b981", color:"#10b981", fontWeight:600, borderRadius:2 }}>+ Add</Button>
            </Box>

            {/* Progress */}
            {targetLiquid > 0 && (
              <Box sx={{ mb:2 }}>
                <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatINR(totalLiquid)} of {formatINR(targetLiquid)} target
                  </Typography>
                  <Typography variant="caption" fontWeight={700}
                    sx={{ color: liquidPct >= 100 ? "#10b981" : liquidPct >= 50 ? "#f59e0b" : "#ef4444" }}>
                    {liquidPct.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={liquidPct}
                  sx={{ borderRadius:3, height:8, bgcolor:"#d1fae5",
                    "& .MuiLinearProgress-bar":{ bgcolor: liquidPct>=100?"#10b981":liquidPct>=50?"#f59e0b":"#ef4444" } }} />
                {liquidPct < 100 && (
                  <Typography variant="caption" sx={{ color:"#ef4444", mt:0.5, display:"block" }}>
                    ⚠️ {formatINR(targetLiquid - totalLiquid)} more needed to reach target
                  </Typography>
                )}
                {liquidPct >= 100 && (
                  <Typography variant="caption" sx={{ color:"#10b981", mt:0.5, display:"block" }}>
                    ✅ Liquid cash target achieved!
                  </Typography>
                )}
              </Box>
            )}

            {liquid.length === 0 ? (
              <Box sx={{ textAlign:"center", py:3 }}>
                <Typography fontSize={32}>💵</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>No liquid cash added yet.</Typography>
                <Typography variant="caption" color="text.secondary">Add savings accounts, FD proceeds, cash at hand</Typography>
              </Box>
            ) : liquid.map(c => <CashCard key={c.id} item={c} />)}

            <Box sx={{ mt:1.5, p:1.5, bgcolor:"#ecfdf5", borderRadius:2 }}>
              <Typography variant="caption" sx={{ color:"#065f46", fontWeight:600 }}>💡 Rule of Thumb</Typography>
              <Typography variant="caption" sx={{ color:"#065f46", display:"block" }}>
                Keep 10–20% of your portfolio value as liquid cash to buy during market dips.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Emergency Fund */}
        <Card sx={{ mb:3, borderRadius:3, border:"1px solid #dbeafe" }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1.5 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color:"#1e40af" }}>
                  🛡️ Emergency Fund
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  For job loss, medical & unexpected expenses
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => openCashAdd("emergency")}
                sx={{ borderColor:"#3b82f6", color:"#3b82f6", fontWeight:600, borderRadius:2 }}>+ Add</Button>
            </Box>

            {/* Progress */}
            {targetEmergency > 0 && (
              <Box sx={{ mb:2 }}>
                <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatINR(totalEmergency)} of {formatINR(targetEmergency)} target
                  </Typography>
                  <Typography variant="caption" fontWeight={700}
                    sx={{ color: emergencyPct>=100?"#10b981":emergencyPct>=50?"#f59e0b":"#ef4444" }}>
                    {emergencyPct.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={emergencyPct}
                  sx={{ borderRadius:3, height:8, bgcolor:"#dbeafe",
                    "& .MuiLinearProgress-bar":{ bgcolor: emergencyPct>=100?"#10b981":emergencyPct>=50?"#f59e0b":"#3b82f6" } }} />
                {emergencyPct < 100 && (
                  <Typography variant="caption" sx={{ color:"#ef4444", mt:0.5, display:"block" }}>
                    ⚠️ {formatINR(targetEmergency - totalEmergency)} more needed to reach target
                  </Typography>
                )}
                {emergencyPct >= 100 && (
                  <Typography variant="caption" sx={{ color:"#10b981", mt:0.5, display:"block" }}>
                    ✅ Emergency fund fully funded!
                  </Typography>
                )}
              </Box>
            )}

            {emergency.length === 0 ? (
              <Box sx={{ textAlign:"center", py:3 }}>
                <Typography fontSize={32}>🛡️</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>No emergency fund added yet.</Typography>
                <Typography variant="caption" color="text.secondary">Add savings set aside for emergencies</Typography>
              </Box>
            ) : emergency.map(c => <CashCard key={c.id} item={c} />)}

            <Box sx={{ mt:1.5, p:1.5, bgcolor:"#eff6ff", borderRadius:2 }}>
              <Typography variant="caption" sx={{ color:"#1e40af", fontWeight:600 }}>💡 Rule of Thumb</Typography>
              <Typography variant="caption" sx={{ color:"#1e40af", display:"block" }}>
                Aim for 6 months of monthly expenses. Keep in a liquid savings account or sweep FD.
              </Typography>
            </Box>
          </CardContent>
        </Card>

      </>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <Box sx={{ background:"#F7F8FA", minHeight:"100vh" }}>

      {/* Top Bar */}
      <Paper elevation={0} sx={{ position:"sticky", top:0, zIndex:100,
        borderBottom:`1px solid ${T.c.border}`, bgcolor:T.c.topbar }}>
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", px:2, py:1.5 }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
            <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center",
              width:34, height:34, borderRadius:2,
              bgcolor:T.c.primary, boxShadow:"0 2px 8px rgba(0,102,255,0.3)", flexShrink:0 }}>
              <Typography sx={{ color:"white", fontWeight:900, fontSize:16, letterSpacing:-1 }}>F</Typography>
            </Box>
            <Typography variant="h6" fontWeight={900} sx={{ letterSpacing:-0.5 }}>
              <Box component="span" sx={{ color:T.c.text1 }}>Folio</Box>
              <Box component="span" sx={{ color:T.c.primary }}>X</Box>
            </Typography>
          </Box>
          <Box sx={{ display:"flex", gap:0.5, alignItems:"center" }}>
            <input type="file" accept=".xlsx,.csv" ref={fileInputRef} style={{ display:"none" }} onChange={handleZerodhaImport} />
            <Tooltip title="Import Zerodha"><IconButton size="small" onClick={() => fileInputRef.current.click()} sx={{ color:T.c.text2 }}><UploadFileIcon /></IconButton></Tooltip>
            <Tooltip title="Refresh prices"><IconButton size="small" onClick={fetchAll} disabled={loading} sx={{ color:T.c.text2 }}><RefreshIcon /></IconButton></Tooltip>
            <Tooltip title="Export CSV"><IconButton size="small" onClick={e => setExportAnchor(e.currentTarget)} sx={{ color:T.c.text2 }}><DownloadIcon /></IconButton></Tooltip>
            {pwaInstallable && (
              <Tooltip title="Install FolioX app">
                <Chip label="Install App" size="small" onClick={() => window.installPWA?.()}
                  sx={{ bgcolor:T.c.primary, color:"white", fontWeight:700, fontSize:11,
                    height:26, cursor:"pointer", display:{ xs:"none", sm:"flex" } }} />
              </Tooltip>
            )}
            <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
              <IconButton size="small" onClick={toggleDark} sx={{ color:T.c.text2 }}>
                {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton size="small" onClick={() => { fetchNotifications(); setNotifOpen(true); }} sx={{ color:T.c.text2 }}>
                <Badge badgeContent={unreadCount} color="error" max={9}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton size="small" onClick={() => setProfileOpen(true)}
                sx={{ p:0.3, overflow:"hidden", width:34, height:34, borderRadius:"50%",
                  border:`2px solid ${T.c.primary}`, boxSizing:"border-box" }}>
                {currentUser?.avatar
                  ? <Box component="img" src={currentUser.avatar} alt="avatar"
                      sx={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover", display:"block" }} />
                  : <Avatar sx={{ width:28, height:28, bgcolor:T.c.primary, fontSize:13, fontWeight:700 }}>
                      {(currentUser?.name||profile.name)?.charAt(0)?.toUpperCase()||"U"}
                    </Avatar>
                }
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {loading && <LinearProgress sx={{ height:2 }} />}
        <Box sx={{ display:"flex", borderTop:`1px solid ${T.c.border}`, overflowX:"auto" }}>
          {["dashboard","assets","liabilities","analytics","cash"].map(tab => (
            <Button key={tab} onClick={() => setActiveTab(tab)}
              sx={{ flex:1, py:1.2, borderRadius:0, textTransform:"capitalize", fontWeight:600, fontSize:12,
                color:activeTab===tab ? T.c.primary : T.c.text3,
                borderBottom:activeTab===tab?`2px solid ${T.c.primary}`:"2px solid transparent",
                background:"transparent", transition:"color 0.15s ease",
                "&:hover":{ color:T.c.primary, background:"transparent" } }}>
              {tab === "cash" ? "Cash" : tab}
            </Button>
          ))}
        </Box>
      </Paper>

      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}
        PaperProps={{ sx:{ bgcolor:T.c.card, border:`1px solid ${T.c.border}` } }}>
        <MenuItem onClick={exportCSV}>📊 Export CSV</MenuItem>
        <MenuItem onClick={exportPDF}>📄 Export PDF</MenuItem>
      </Menu>

      <Container maxWidth="sm" sx={{ py:2 }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && <>
          {/* IndMoney-style hero — white card, blue accent */}
          <Card sx={{ mb:2, borderRadius:T.radius.card, bgcolor:"#0066FF",
            boxShadow:"0 4px 20px rgba(0,102,255,0.25)", overflow:"hidden", position:"relative" }}>
            <CardContent sx={{ p:2.5, pb:"20px !important" }}>
              <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:600,
                letterSpacing:"0.5px", mb:0.5 }}>Total Portfolio Value</Typography>
              <Typography sx={{ fontSize:32, fontWeight:700, color:"#fff", lineHeight:1.1, mb:2 }}>
                {formatINR(networth.netWorth)}
              </Typography>
              <Box sx={{ display:"flex", gap:3 }}>
                <Box>
                  <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.6)", mb:0.3 }}>Invested</Typography>
                  <Typography sx={{ fontSize:14, fontWeight:700, color:"#fff" }}>{formatINR(totalInvested)}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.6)", mb:0.3 }}>P&L</Typography>
                  <Typography sx={{ fontSize:14, fontWeight:700, color:totalGain>=0?"#7FFFD4":"#FFB3B3" }}>
                    {totalGain>=0?"+":""}{formatINR(totalGain)} ({gainPct}%)
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.6)", mb:0.3 }}>Holdings</Typography>
                  <Typography sx={{ fontSize:14, fontWeight:700, color:"#fff" }}>{assets.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Grid container spacing={1.5} sx={{ mb:2 }}>
            <Grid item xs={6}><StatCard icon={<TrendingUpIcon />} label="Total Assets" value={formatINR(networth.totalAssets)} sub={`${assets.length} holdings`} color={T.c.gain} bg="#E6F7F3" /></Grid>
            <Grid item xs={6}><StatCard icon={<CreditCardIcon />} label="Liabilities" value={formatINR(networth.totalLiabilities)} sub={`${liabilities.length} loans`} color={T.c.loss} bg="#FEF0EF" /></Grid>
            <Grid item xs={6}><StatCard icon={<BalanceIcon />} label="Debt Ratio" value={`${debtRatio}%`} sub={debtRatio<40?"Healthy":"Risky"} color="#F59E0B" bg="#FEF9EE" /></Grid>
            <Grid item xs={6}><StatCard icon={<AccountBalanceIcon />} label="Invested" value={formatINR(totalInvested)} sub="cost basis" color={T.c.primary} bg="#EEF4FF" /></Grid>
          </Grid>
          {assets.length > 0 && (
            <Card sx={{ mb:3, borderRadius:3, bgcolor:T.c.card }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb:1 }}>Portfolio Allocation</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={assets.map(a => ({ name:a.name, value:+(a.current_price*a.quantity).toFixed(0) }))}
                      dataKey="value" outerRadius={90} innerRadius={45} paddingAngle={1}>
                      {assets.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <ReTooltip formatter={(v,n) => [formatINR(v),n]}
                      contentStyle={{ borderRadius:10, border:"1px solid #e5e7eb", fontSize:13, fontWeight:600 }} />
                  </PieChart>
                </ResponsiveContainer>
                <Typography variant="caption" color="text.secondary" sx={{ display:"block", textAlign:"center", mt:0.5 }}>
                  Hover over a slice to see details
                </Typography>
              </CardContent>
            </Card>
          )}
          <Card sx={{ mb:2, borderRadius:T.radius.card, boxShadow:T.shadow.card, border:`1px solid ${T.c.border}`, bgcolor:T.c.card }}>
            <CardContent>
              <Typography sx={{ fontSize:14, fontWeight:700, color:T.c.text1, mb:1.5 }}>Overview</Typography>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  {name:"Assets",      value:+networth.totalAssets.toFixed(0)},
                  {name:"Liabilities", value:+networth.totalLiabilities.toFixed(0)},
                  {name:"Net Worth",   value:+networth.netWorth.toFixed(0)}
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize:12 }} />
                  <YAxis tickFormatter={v => formatINR(v)} tick={{ fontSize:11 }} />
                  <ReTooltip formatter={v => formatINR(v)} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    <Cell fill="#10b981" /><Cell fill="#ef4444" /><Cell fill="#6366f1" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>}

        {/* ASSETS */}
        {activeTab === "assets" && <>
          <Box sx={{ mb:2.5 }}>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <Box>
                <Typography sx={{ fontSize:18, fontWeight:700, color:T.c.text1 }}>Holdings</Typography>
                <Typography sx={{ fontSize:12, color:T.c.text2, mt:0.2 }}>{assets.length} assets · {formatINR(networth.totalAssets)}</Typography>
              </Box>
              <Box sx={{ display:"flex", gap:1, alignItems:"center" }}>
                <Button size="small" onClick={() => { setSelectMode(s => !s); setSelectedAssets([]); }}
                  sx={{ fontSize:11, fontWeight:600, borderRadius:"8px", color:selectMode?T.c.loss:T.c.primary,
                    bgcolor:selectMode?"#FEF0EF":"#EEF4FF",
                    "&:hover":{ bgcolor:selectMode?"#FDDCDA":"#D6E8FF" }, px:1.5, minWidth:0 }}>
                  {selectMode ? "✕ Cancel" : "☑ Select"}
                </Button>

              </Box>
            </Box>

            {/* Bulk action bar */}
            <Collapse in={selectMode}>
              <Box sx={{ mt:1.5, p:1.5, borderRadius:"10px", bgcolor:T.c.bg,
                border:`1px solid ${T.c.border}`,
                display:"flex", alignItems:"center", gap:1.5 }}>
                <Checkbox
                  size="small"
                  checked={selectedAssets.length === assets.length && assets.length > 0}
                  indeterminate={selectedAssets.length > 0 && selectedAssets.length < assets.length}
                  onChange={e => setSelectedAssets(e.target.checked ? assets.map(a => a.id) : [])}
                  sx={{ p:0.5, color:T.c.primary, "&.Mui-checked":{ color:T.c.primary }, "&.MuiCheckbox-indeterminate":{ color:T.c.primary } }} />
                <Typography variant="body2" fontWeight={700} sx={{ color:T.c.text1, flex:1 }}>
                  {selectedAssets.length > 0 ? `${selectedAssets.length} selected` : "Select all"}
                </Typography>
                {selectedAssets.length > 0 && <>
                  <Button size="small" variant="outlined" onClick={() => setBulkEditOpen(true)}
                    sx={{ borderColor:T.c.primary, color:T.c.primary, fontWeight:600,
                      borderRadius:"8px", fontSize:11 }}>
                    ✏️ Edit {selectedAssets.length}
                  </Button>
                  <Button size="small" variant="contained" onClick={handleBulkDelete}
                    sx={{ bgcolor:T.c.loss, "&:hover":{ bgcolor:"#C53A2F" }, fontWeight:600,
                      borderRadius:"8px", fontSize:11 }}>
                    🗑 Delete {selectedAssets.length}
                  </Button>
                </>}
              </Box>
            </Collapse>
          </Box>
          {assets.length === 0
            ? <Typography color="text.secondary" sx={{ textAlign:"center", py:5 }}>No assets yet. Tap + to add.</Typography>
            : assets.map(a => <AssetCard key={a.id} a={a} />)}
        </>}

        {/* LIABILITIES */}
        {activeTab === "liabilities" && <>
          <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
            <Typography variant="h6" fontWeight={700}>Liabilities ({liabilities.length})</Typography>
            <Chip label={formatINR(networth.totalLiabilities)} sx={{ bgcolor:"#fef2f2", color:"#ef4444", fontWeight:700 }} />
          </Box>
          {liabilities.length === 0
            ? <Typography color="text.secondary" sx={{ textAlign:"center", py:5 }}>No liabilities yet. Tap + to add.</Typography>
            : liabilities.map(l => <LiabilityCard key={l.id} l={l} />)}
        </>}

        {/* CASH */}
        {activeTab === "cash" && <CashTab />}

        {/* ANALYTICS */}
        {activeTab === "analytics" && <AnalyticsTab />}

        {/* AI ADVISOR tab removed - now floating */}

      </Container>

      {/* FAB */}
      <Fab onClick={() => handleOpen("add")}
        sx={{ position:"fixed", bottom:28, right:24, bgcolor:T.c.primary, color:"white",
          boxShadow:T.shadow.fab, borderRadius:"14px",
          "&:hover":{ bgcolor:"#0052CC" }, transition:"all 0.15s ease" }}>
        <AddIcon />
      </Fab>

      {/* AI Advisor FAB */}
      <Fab onClick={() => setAiOpen(true)}
        sx={{ position:"fixed", bottom:28, right:92, bgcolor:"white", color:T.c.primary,
          boxShadow:"0 4px 16px rgba(0,0,0,0.10)", border:`1px solid ${T.c.border}`,
          borderRadius:"14px", "&:hover":{ bgcolor:"#EEF4FF" }, transition:"all 0.15s ease" }}>
        <SmartToyIcon />
      </Fab>

      {/* AI Advisor Drawer */}
      <Drawer anchor="right" open={aiOpen} onClose={() => setAiOpen(false)}
        PaperProps={{ sx:{ width:{ xs:"100vw", sm:400 }, display:"flex", flexDirection:"column" } }}>

        {/* Header */}
        <Box sx={{ p:2.5, background:T.grad.dark, position:"relative", overflow:"hidden",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Box sx={{ position:"absolute", top:-20, right:-20, width:100, height:100,
            borderRadius:"50%", bgcolor:"rgba(139,92,246,0.3)", filter:"blur(30px)", pointerEvents:"none" }} />
          <Box sx={{ display:"flex", alignItems:"center", gap:1.5, position:"relative", zIndex:1 }}>
            <Box sx={{ width:40, height:40, borderRadius:"14px", bgcolor:"rgba(255,255,255,0.15)",
              border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center",
              backdropFilter:"blur(10px)" }}>
              <SmartToyIcon sx={{ color:"white", fontSize:22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={900} sx={{ color:"white", lineHeight:1.2, letterSpacing:"-0.3px" }}>
                AI Portfolio Advisor
              </Typography>
              <Box sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
                <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#6ee7b7",
                  boxShadow:"0 0 6px #6ee7b7", animation:"pulse 2s infinite",
                  "@keyframes pulse":{ "0%,100%":{ opacity:1 }, "50%":{ opacity:0.4 } } }} />
                <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.6)", fontWeight:600, fontSize:10 }}>
                  Groq LLaMA · Live data
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton onClick={() => setAiOpen(false)}
            sx={{ color:"rgba(255,255,255,0.7)", bgcolor:"rgba(255,255,255,0.1)", width:32, height:32,
              borderRadius:"10px", "&:hover":{ bgcolor:"rgba(255,255,255,0.2)", color:"white" } }}>✕</IconButton>
        </Box>

        {/* Quick Insights horizontal scroll */}
        {quickInsights.length > 0 && (
          <Box sx={{ px:1.5, pt:1.5, display:"flex", gap:1, overflowX:"auto",
            pb:1, borderBottom:`1px solid ${T.c.border}`,
            "&::-webkit-scrollbar":{ display:"none" } }}>
            {quickInsights.map((ins,i) => {
              const CMAP = { positive:"#10b981", warning:"#f59e0b", action:"#6366f1", info:"#8b5cf6" };
              const IMAP = { positive:"✅", warning:"⚠️", action:"🎯", info:"💡" };
              return (
                <Box key={i} sx={{ minWidth:160, p:1.2, borderRadius:2, flexShrink:0,
                  bgcolor:T.c.bg, border:"1px solid #e5e7eb" }}>
                  <Typography variant="caption" fontWeight={700}
                    sx={{ color:CMAP[ins.type]||"#6366f1", display:"block", mb:0.3 }}>
                    {IMAP[ins.type]||"💡"} {ins.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color:T.c.text2, fontSize:10, lineHeight:1.4 }}>
                    {ins.message}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Messages */}
        <Box sx={{ flex:1, overflowY:"auto", p:2 }}>
          {chatMessages.length === 0 ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb:2, textAlign:"center", mt:2 }}>
                Ask me anything about your portfolio:
              </Typography>
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:1, justifyContent:"center" }}>
                {[
                  "How is my portfolio performing?",
                  "Which stocks should I sell?",
                  "Am I too concentrated?",
                  "Should I rebalance?",
                  "What is dragging my returns?",
                  "How diversified am I?",
                ].map((q,i) => (
                  <Chip key={i} label={q} size="small" onClick={() => setChatInput(q)}
                    sx={{ cursor:"pointer", bgcolor:"#f5f3ff", color:"#6366f1",
                      fontWeight:600, fontSize:11, "&:hover":{ bgcolor:"#ede9fe" } }} />
                ))}
              </Box>
            </Box>
          ) : (
            <>
              {chatMessages.map((msg,i) => (
                <Box key={i} sx={{ mb:2, display:"flex",
                  justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
                  {msg.role === "assistant" && (
                    <Avatar sx={{ bgcolor:"#6366f1", width:28, height:28, mr:1, mt:0.5, flexShrink:0 }}>
                      <SmartToyIcon sx={{ fontSize:16 }} />
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth:"80%", p:1.5, borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                    background:msg.role==="user"?T.grad.primary:"white",
                    boxShadow:msg.role==="user"?"0 4px 12px rgba(99,102,241,0.3)":"0 2px 8px rgba(0,0,0,0.06)",
                    border:msg.role==="assistant"?"1px solid rgba(99,102,241,0.08)":"none" }}>
                    <Typography variant="body2"
                      sx={{ color:msg.role==="user"?"white":"#1e1b4b",
                        whiteSpace:"pre-wrap", lineHeight:1.7, fontSize:13 }}>
                      {msg.content}
                    </Typography>
                  </Box>
                  {msg.role === "user" && (
                    <Avatar sx={{ bgcolor:"#e5e7eb", width:28, height:28, ml:1, mt:0.5, flexShrink:0 }}>
                      {currentUser?.avatar
                        ? <Box component="img" src={currentUser.avatar} sx={{ width:28, height:28, borderRadius:"50%" }} />
                        : <Typography sx={{ fontSize:12, fontWeight:700, color:T.c.text2 }}>
                            {currentUser?.name?.charAt(0)||"U"}
                          </Typography>
                      }
                    </Avatar>
                  )}
                </Box>
              ))}
              {chatLoading && (
                <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:2 }}>
                  <Avatar sx={{ bgcolor:"#6366f1", width:28, height:28 }}>
                    <SmartToyIcon sx={{ fontSize:16 }} />
                  </Avatar>
                  <Box sx={{ p:1.5, bgcolor:T.c.bg, border:"1px solid #e5e7eb", borderRadius:2 }}>
                    <Box sx={{ display:"flex", gap:0.5 }}>
                      {[0,1,2].map(i => (
                        <Box key={i} sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#6366f1",
                          animation:"bounce 1.2s infinite", animationDelay:`${i*0.2}s`,
                          "@keyframes bounce":{
                            "0%,80%,100%":{ transform:"scale(0.6)", opacity:0.4 },
                            "40%":{ transform:"scale(1)", opacity:1 }
                          }}} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </Box>

        {/* Input */}
        <Box sx={{ p:2, borderTop:"1px solid rgba(99,102,241,0.08)", display:"flex", flexDirection:"column", gap:1, bgcolor:"#fafafa" }}>
          {chatMessages.length > 0 && (
            <Button size="small" onClick={() => setChatMessages([])}
              sx={{ color:T.c.text3, fontSize:11, alignSelf:"flex-start", p:0 }}>
              Clear conversation
            </Button>
          )}
          <Box sx={{ display:"flex", gap:1 }}>
            <TextField fullWidth size="small" placeholder="Ask about your portfolio..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendChatMessage(); }}}
              sx={{ "& .MuiOutlinedInput-root":{ borderRadius:3 } }} />
            <IconButton onClick={sendChatMessage} disabled={!chatInput.trim()||chatLoading}
              sx={{ background:T.grad.primary, color:"white", borderRadius:"12px", width:42, height:42,
                boxShadow:"0 4px 12px rgba(99,102,241,0.35)",
                "&:hover":{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", transform:"scale(1.05)" },
                "&:disabled":{ bgcolor:"#e5e7eb", color:T.c.text3, boxShadow:"none", transform:"none" },
                transition:"all 0.2s ease" }}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Drawer>

      {/* Notifications Drawer */}
      <Drawer anchor="right" open={notifOpen} onClose={() => setNotifOpen(false)}>
        <Box sx={{ width:340, height:"100%", display:"flex", flexDirection:"column" }}>
          <Box sx={{ p:2.5, borderBottom:"1px solid #e5e7eb", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>🔔 Notifications</Typography>
              {unreadCount > 0 && <Typography variant="caption" sx={{ color:"#6366f1" }}>{unreadCount} unread</Typography>}
            </Box>
            <Box sx={{ display:"flex", gap:1 }}>
              {notifications.length > 0 && <>
                <Button size="small" sx={{ fontSize:11, color:"#6366f1" }}
                  onClick={async () => { await apiFetch(`${API}/notifications/read-all`,{method:"PUT"}); fetchNotifications(); }}>
                  Mark all read
                </Button>
                <Button size="small" sx={{ fontSize:11, color:"#ef4444" }}
                  onClick={async () => { await apiFetch(`${API}/notifications/clear-all`,{method:"DELETE"}); fetchNotifications(); }}>
                  Clear all
                </Button>
              </>}
            </Box>
          </Box>
          <Box sx={{ flex:1, overflowY:"auto", p:1.5 }}>
            {notifications.length === 0 ? (
              <Box sx={{ textAlign:"center", py:8 }}>
                <Typography fontSize={40}>🔕</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>No notifications yet.</Typography>
                <Typography variant="caption" color="text.secondary">Alerts will appear here automatically.</Typography>
              </Box>
            ) : (
              notifications.map((n,i) => {
                const c = NOTIF_COLORS[n.type] || NOTIF_COLORS.weekly;
                return (
                  <Box key={i} sx={{ mb:1.5, p:1.5, borderRadius:2,
                    bgcolor:n.is_read?"#f9fafb":c.bg, border:`1px solid ${n.is_read?"#e5e7eb":c.border}`,
                    opacity:n.is_read?0.75:1 }}>
                    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <Typography variant="body2" fontWeight={700} sx={{ color:n.is_read?"#374151":c.color, flex:1 }}>
                        {n.title}
                      </Typography>
                      <Box sx={{ display:"flex", gap:0.5, ml:1 }}>
                        {!n.is_read && (
                          <Tooltip title="Mark as read">
                            <IconButton size="small" sx={{ p:0.3 }}
                              onClick={async () => { await apiFetch(`${API}/notifications/${n.id}/read`,{method:"PUT"}); fetchNotifications(); }}>
                              <CheckCircleIcon sx={{ fontSize:16, color:"#10b981" }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" sx={{ p:0.3 }}
                            onClick={async () => { await apiFetch(`${API}/notifications/${n.id}`,{method:"DELETE"}); fetchNotifications(); }}>
                            <DeleteIcon sx={{ fontSize:16, color:T.c.text3 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display:"block", mt:0.5, lineHeight:1.5 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color:T.c.text3, fontSize:10, mt:0.5, display:"block" }}>
                      {new Date(n.created_at).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
          <Box sx={{ p:2, borderTop:"1px solid #e5e7eb" }}>
            <Button fullWidth variant="outlined" size="small"
              sx={{ borderColor:"#6366f1", color:"#6366f1", fontWeight:600, borderRadius:2 }}
              onClick={async () => {
                await apiFetch(`${API}/notifications/run-checks`, { method:"POST" });
                fetchNotifications(); showSnack("Notification checks ran!");
              }}>
              🔍 Run checks now
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Profile Drawer */}
      <Drawer anchor="right" open={profileOpen} onClose={() => setProfileOpen(false)}>
        <Box sx={{ width:320, height:"100%", display:"flex", flexDirection:"column" }}>
          <Box sx={{ p:3, background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            {currentUser?.avatar
              ? <Box component="img" src={currentUser.avatar} alt="avatar"
                  sx={{ width:64, height:64, borderRadius:"50%", mb:1.5, border:"3px solid rgba(255,255,255,0.5)" }} />
              : <Avatar sx={{ width:64, height:64, bgcolor:"rgba(255,255,255,0.2)", fontSize:28, fontWeight:800, mb:1.5 }}>
                  {profileEdit.name?.charAt(0)?.toUpperCase()||"U"}
                </Avatar>
            }
            <Typography variant="h6" fontWeight={800} sx={{ color:"white" }}>{profileEdit.name||"Investor"}</Typography>
            {(currentUser?.email||profileEdit.email) && (
              <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.8)" }}>
                {currentUser?.email||profileEdit.email}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex:1, overflowY:"auto", p:2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb:2, color:T.c.text1 }}>👤 Personal Info</Typography>
            <TextField label="Name" fullWidth sx={{ mb:2 }} value={profileEdit.name}
              onChange={e => setProfileEdit(p => ({...p, name:e.target.value}))} />
            <TextField label="Email" fullWidth sx={{ mb:2 }} value={profileEdit.email}
              onChange={e => setProfileEdit(p => ({...p, email:e.target.value}))} />
            <TextField label="Phone" fullWidth sx={{ mb:3 }} value={profileEdit.phone}
              onChange={e => setProfileEdit(p => ({...p, phone:e.target.value}))} />
            <Divider sx={{ mb:2 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb:2, color:T.c.text1 }}>🔔 Alert Settings</Typography>
            <TextField label="Net Worth Milestone (₹)" type="number" fullWidth sx={{ mb:2 }}
              value={profileEdit.networth_milestone}
              helperText="Get notified when net worth crosses this amount"
              onChange={e => setProfileEdit(p => ({...p, networth_milestone:e.target.value}))} />
            <TextField label="P&L Alert Threshold (%)" type="number" fullWidth sx={{ mb:3 }}
              value={profileEdit.pl_alert_pct}
              helperText="Get notified when portfolio gain/loss crosses this %"
              onChange={e => setProfileEdit(p => ({...p, pl_alert_pct:e.target.value}))} />
            <Divider sx={{ mb:2 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb:1.5, color:T.c.text1 }}>📋 Notification Schedule</Typography>
            <Box sx={{ bgcolor:"#f5f3ff", borderRadius:2, p:1.5, mb:1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color:"#6366f1" }}>📋 Weekly Digest</Typography>
              <Typography variant="caption" color="text.secondary">Every Monday at 9:00 AM IST</Typography>
            </Box>
            <Box sx={{ bgcolor:"#ecfdf5", borderRadius:2, p:1.5, mb:1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color:"#10b981" }}>⚠️ Drift & P&L Alerts</Typography>
              <Typography variant="caption" color="text.secondary">Daily at 4:00 PM IST</Typography>
            </Box>
            <Box sx={{ bgcolor:"#fffbeb", borderRadius:2, p:1.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color:"#f59e0b" }}>🎯 Milestone Alerts</Typography>
              <Typography variant="caption" color="text.secondary">Checked daily with price updates</Typography>
            </Box>
          </Box>
          <Box sx={{ p:2, borderTop:"1px solid #e5e7eb", display:"flex", flexDirection:"column", gap:1 }}>
            <Button fullWidth variant="contained" onClick={handleSaveProfile}
              sx={{ bgcolor:"#6366f1", "&:hover":{ bgcolor:"#4f46e5" }, fontWeight:700, borderRadius:2 }}>
              Save Profile
            </Button>
            <Button fullWidth variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}
              sx={{ borderColor:"#ef4444", color:"#ef4444", fontWeight:700, borderRadius:2 }}>
              Sign Out
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight:900, letterSpacing:"-0.5px", pb:1 }}>{editMode ? "✏️ Edit Entry" : "➕ Add Entry"}</DialogTitle>
        <DialogContent sx={{ pt:1 }}>

          {/* Asset or Liability toggle */}
          {!editMode && (
            <ToggleButtonGroup value={type} exclusive onChange={(e,v) => v && setType(v)} fullWidth sx={{ mb:2 }}>
              <ToggleButton value="asset" sx={{ fontWeight:600 }}>Asset</ToggleButton>
              <ToggleButton value="liability" sx={{ fontWeight:600 }}>Liability</ToggleButton>
            </ToggleButtonGroup>
          )}

          {/* Asset type selector */}
          {((!editMode && type==="asset") || (editMode && editItemType==="asset")) && (
            <Box sx={{ mb:2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb:1, display:"block", fontWeight:600 }}>
                Asset Type
              </Typography>
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:1 }}>
                {[
                  { value:"Equity",     label:"📈 Stock" },
                  { value:"MutualFund", label:"📊 Mutual Fund" },
                  { value:"Gold",       label:"🥇 Gold" },
                  { value:"Cash",       label:"💵 Cash" },
                  { value:"FD",         label:"🏦 FD / RD" },
                  { value:"Other",      label:"📦 Other" },
                ].map(a => (
                  <Chip key={a.value} label={a.label} onClick={() => setAssetType(a.value)}
                    sx={{ cursor:"pointer", fontWeight:600,
                      bgcolor:assetType===a.value?"#6366f1":"#f3f4f6",
                      color:assetType===a.value?"white":"#374151" }} />
                ))}
              </Box>
            </Box>
          )}

          <TextField label="Name" fullWidth sx={{ mb:2, "& .MuiInputBase-root":{ bgcolor:T.c.input, color:T.c.text1 }, "& .MuiInputLabel-root":{ color:T.c.text2 } }} value={name} onChange={e => setName(e.target.value)} />

          {/* Stock / Mutual Fund fields */}
          {((!editMode && type==="asset") || (editMode && editItemType==="asset")) &&
           (assetType === "Equity" || assetType === "MutualFund") && <>
            <TextField label={assetType==="MutualFund" ? "Buy NAV (₹)" : "Buy Price (₹)"}
              type="number" fullWidth sx={{ mb:2 }} value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
            <TextField label={assetType==="MutualFund" ? "Units" : "Quantity"}
              type="number" fullWidth sx={{ mb:2 }} value={quantity} onChange={e => setQuantity(e.target.value)} />
            <Box sx={{ position:"relative" }}>
              <TextField label="Stock Symbol (e.g. TCS.NS)" fullWidth value={symbolSearch} autoComplete="off"
                helperText="Type to search NSE / BSE / US stocks"
                onChange={async (e) => {
                  const val = e.target.value;
                  setSymbolSearch(val); setSymbol(val);
                  if (val.length >= 2) {
                    try {
                      const res  = await apiFetch(`${API}/search-stocks?q=${val}`);
                      const data = await res.json();
                      setSymbolSuggestions(data); setShowSuggestions(true);
                    } catch { setSymbolSuggestions([]); }
                  } else { setSymbolSuggestions([]); setShowSuggestions(false); }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
              {showSuggestions && symbolSuggestions.length > 0 && (
                <Paper sx={{ position:"absolute", top:"100%", left:0, right:0, zIndex:9999,
                  maxHeight:260, overflowY:"auto", border:"1px solid #e5e7eb", borderRadius:2,
                  boxShadow:"0 8px 24px rgba(0,0,0,0.12)" }}>
                  {symbolSuggestions.map((s,i) => (
                    <Box key={i} onMouseDown={() => { setSymbol(s.symbol); setSymbolSearch(s.symbol); setShowSuggestions(false); }}
                      sx={{ px:2, py:1.2, cursor:"pointer", borderBottom:`1px solid ${T.c.border}`,
                        "&:hover":{ bgcolor:"#f5f3ff" }, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color:"#6366f1" }}>{s.symbol}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.name}</Typography>
                      </Box>
                      <Chip label={s.exchange} size="small"
                        sx={{ fontSize:10, height:18,
                          bgcolor:s.exchange==="NSE"?"#ecfdf5":s.exchange==="BSE"?"#eff6ff":"#f5f3ff",
                          color:s.exchange==="NSE"?"#10b981":s.exchange==="BSE"?"#3b82f6":"#8b5cf6" }} />
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </>}

          {/* Gold / Cash / FD / Other — just amount */}
          {((!editMode && type==="asset") || (editMode && editItemType==="asset")) &&
           (assetType === "Gold" || assetType === "Cash" || assetType === "FD" || assetType === "Other") && <>
            <TextField
              label={assetType==="Gold" ? "Current Value (₹)" : assetType==="FD" ? "FD Amount (₹)" : "Amount (₹)"}
              type="number" fullWidth sx={{ mb:2 }} value={buyPrice}
              onChange={e => setBuyPrice(e.target.value)}
              helperText={assetType==="FD" ? "Principal amount invested" : assetType==="Gold" ? "Total value of gold holdings" : ""} />
          </>}

          {/* Liability fields */}
          {((!editMode && type==="liability") || (editMode && editItemType==="liability")) && <>
            <TextField label="Loan Amount (₹)" type="number" fullWidth sx={{ mb:2 }} value={value} onChange={e => setValue(e.target.value)} />
            <TextField label="Interest Rate (%)" type="number" fullWidth sx={{ mb:2 }} value={interest} onChange={e => setInterest(e.target.value)} />
            <TextField label="Tenure (Years)" type="number" fullWidth value={tenure} onChange={e => setTenure(e.target.value)} />
          </>}

        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ bgcolor:"#6366f1", "&:hover":{ bgcolor:"#4f46e5" }, fontWeight:700 }}>
            {editMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dividend Dialog */}
      <Dialog open={divOpen} onClose={() => setDivOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight:700, color:T.c.text1 }}>💰 Log Dividend</DialogTitle>
        <DialogContent sx={{ pt:1 }}>
          <FormControl fullWidth sx={{ mb:2 }}>
            <InputLabel>Stock</InputLabel>
            <Select value={divAssetId} label="Stock" onChange={e => setDivAssetId(e.target.value)}>
              {assets.map(a => <MenuItem key={a.id} value={a.id}>{a.name}{a.symbol?` (${a.symbol})`:""}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Dividend Amount (₹)" type="number" fullWidth sx={{ mb:2 }} value={divAmount} onChange={e => setDivAmount(e.target.value)} />
          <TextField label="Received Date" type="date" fullWidth sx={{ mb:2 }} value={divDate}
            onChange={e => setDivDate(e.target.value)} InputLabelProps={{ shrink:true }} />
          <TextField label="Notes (optional)" fullWidth value={divNotes} onChange={e => setDivNotes(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setDivOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddDividend}
            sx={{ bgcolor:"#6366f1", "&:hover":{ bgcolor:"#4f46e5" }, fontWeight:700 }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Target Dialog */}
      <Dialog open={targetOpen} onClose={() => setTargetOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight:700, color:T.c.text1 }}>🎯 Set Target Allocation</DialogTitle>
        <DialogContent sx={{ pt:1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>
            Set desired portfolio weight for <strong>{targetAsset?.name}</strong>
          </Typography>
          <TextField label="Target %" type="number" fullWidth value={targetPct}
            onChange={e => setTargetPct(e.target.value)}
            helperText="e.g. 10 means this stock should be 10% of your portfolio" />
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setTargetOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateTarget}
            sx={{ bgcolor:"#6366f1", "&:hover":{ bgcolor:"#4f46e5" }, fontWeight:700 }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Sector Dialog */}
      <Dialog open={sectorOpen} onClose={() => setSectorOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight:700, color:T.c.text1 }}>🏭 Set Sector</DialogTitle>
        <DialogContent sx={{ pt:1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>
            Assign sector for <strong>{sectorEditAsset?.name}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Sector</InputLabel>
            <Select value={sectorEditVal} label="Sector" onChange={e => setSectorEditVal(e.target.value)}>
              {SECTORS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setSectorOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSector}
            sx={{ bgcolor:"#6366f1", "&:hover":{ bgcolor:"#4f46e5" }, fontWeight:700 }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Cash Dialog — outside CashTab to prevent re-render focus loss */}
      <Dialog open={cashOpen} onClose={() => setCashOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight:700, color:T.c.text1 }}>
          {cashEditMode ? "✏️ Edit" : cashCategory==="liquid" ? "💵 Add Liquid Cash" : "🛡️ Add Emergency Fund"}
        </DialogTitle>
        <DialogContent sx={{ pt:1 }}>
          <Box sx={{ display:"flex", gap:1, mb:2 }}>
            {[{v:"liquid",l:"💵 Liquid Cash"},{v:"emergency",l:"🛡️ Emergency"}].map(o => (
              <Chip key={o.v} label={o.l} onClick={() => setCashCategory(o.v)}
                sx={{ cursor:"pointer", fontWeight:600,
                  bgcolor:cashCategory===o.v?"#6366f1":"#f3f4f6",
                  color:cashCategory===o.v?"white":"#374151" }} />
            ))}
          </Box>
          <TextField label="Name (e.g. HDFC Savings, Emergency FD)" fullWidth sx={{ mb:2 }}
            value={cashName} onChange={e => setCashName(e.target.value)} />
          <TextField label="Current Amount (₹)" type="number" fullWidth sx={{ mb:2 }}
            value={cashAmount} onChange={e => setCashAmount(e.target.value)} />
          <TextField label="Target Amount (₹) — optional" type="number" fullWidth sx={{ mb:2 }}
            value={cashTarget} onChange={e => setCashTarget(e.target.value)}
            helperText={cashCategory==="liquid"?"e.g. 10% of portfolio value":"e.g. 6× monthly expenses"} />
          <TextField label="Notes (optional)" fullWidth multiline rows={2}
            value={cashNotes} onChange={e => setCashNotes(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setCashOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCash}
            sx={{ bgcolor:"#6366f1", "&:hover":{ bgcolor:"#4f46e5" }, fontWeight:700 }}>
            {cashEditMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {/* ── Bulk Edit Dialog ────────────────────────────────────── */}
      <Dialog open={bulkEditOpen} onClose={() => setBulkEditOpen(false)} fullWidth maxWidth="xs"
        PaperProps={{ sx:{ borderRadius:"16px", bgcolor:T.c.card } }}>
        <DialogTitle sx={{ fontWeight:700, color:T.c.text1 }}>
          ✏️ Bulk Edit {selectedAssets.length} Assets
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize:13, color:T.c.text2, mb:2 }}>
            Apply the same value to all selected assets at once.
          </Typography>
          <FormControl fullWidth sx={{ mb:2 }}>
            <InputLabel>Field to Edit</InputLabel>
            <Select value={bulkField} label="Field to Edit" onChange={e => { setBulkField(e.target.value); setBulkValue(""); }}
              sx={{ bgcolor:T.c.input, color:T.c.text1 }}>
              <MenuItem value="sector">Sector</MenuItem>
              <MenuItem value="target">Target Allocation (%)</MenuItem>
            </Select>
          </FormControl>
          {bulkField === "sector"
            ? <FormControl fullWidth>
                <InputLabel>Sector</InputLabel>
                <Select value={bulkValue} label="Sector" onChange={e => setBulkValue(e.target.value)}
                  sx={{ bgcolor:T.c.input, color:T.c.text1 }}>
                  {["IT","Banking","Finance","Pharma","Healthcare","Auto","FMCG","Energy","Metals","Infrastructure","Realty","Telecom","Chemicals","Consumer","Index Fund","Mutual Fund","Gold","Fixed Income","Cash","Other"].map(s =>
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  )}
                </Select>
              </FormControl>
            : <TextField fullWidth label="Target %" type="number" value={bulkValue}
                onChange={e => setBulkValue(e.target.value)}
                helperText="e.g. 10 means 10% of portfolio"
                InputProps={{ sx:{ bgcolor:T.c.input, color:T.c.text1 } }} />
          }
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setBulkEditOpen(false)} sx={{ color:T.c.text2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkEdit}
            sx={{ bgcolor:T.c.primary, fontWeight:700, borderRadius:"8px" }}>
            Apply to {selectedAssets.length} assets
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({...s,open:false}))}
        anchorOrigin={{ vertical:"bottom", horizontal:"center" }}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius:2 }}>{snack.msg}</Alert>
      </Snackbar>

    </Box>
  );
}