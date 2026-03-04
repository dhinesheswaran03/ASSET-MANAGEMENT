import { useEffect, useState, useRef } from "react";
import {
  Container, Typography, Card, CardContent, Box, Fab, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Button,
  ToggleButton, ToggleButtonGroup, Chip, IconButton, Avatar,
  LinearProgress, Menu, MenuItem, Tooltip, Snackbar, Alert,
  Grid, Paper, Select, FormControl, InputLabel, Table,
  TableBody, TableCell, TableHead, TableRow, Badge, Drawer, Divider
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
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area, Line
} from "recharts";

const API = "http://localhost:5000";
const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316","#a855f7"];
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
    <Box sx={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)"
    }}>
      <Card sx={{ borderRadius:4, p:2, maxWidth:400, width:"90%", textAlign:"center",
        boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <CardContent sx={{ p:4 }}>
          <Avatar sx={{ bgcolor:"#6366f1", width:72, height:72, mx:"auto", mb:2 }}>
            <AccountBalanceWalletIcon sx={{ fontSize:40 }} />
          </Avatar>
          <Typography variant="h4" fontWeight={900} sx={{ color:"#6366f1", mb:0.5 }}>WealthTrack</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb:4 }}>
            Your personal portfolio & net worth tracker
          </Typography>
          {[
            "📈 Track stocks & net worth in real-time",
            "🏭 Sector allocation & drift alerts",
            "💰 Dividend tracker & P&L analytics",
            "🤖 AI Portfolio Advisor powered by Gemini",
          ].map((f,i) => (
            <Box key={i} sx={{ display:"flex", alignItems:"center", mb:1.5, textAlign:"left" }}>
              <Typography variant="body2" sx={{ color:"#374151" }}>{f}</Typography>
            </Box>
          ))}
          <Button fullWidth variant="contained" size="large"
            startIcon={<GoogleIcon />}
            onClick={() => window.location.href = `${API}/auth/google`}
            sx={{ mt:3, py:1.5, borderRadius:3, textTransform:"none",
              bgcolor:"white", color:"#374151", fontWeight:700, fontSize:16,
              border:"1px solid #e5e7eb", boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
              "&:hover":{ bgcolor:"#f9fafb", boxShadow:"0 4px 16px rgba(0,0,0,0.15)" } }}>
            Continue with Google
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display:"block", mt:2 }}>
            Your data is private and secure 🔒
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
      await fetch(`${API}/auth/complete-onboarding`, {
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
              <Typography variant="body2" color="text.secondary" sx={{ mb:3 }}>
                Let's set up your WealthTrack account in just 2 steps.
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
              <Typography variant="body2" color="text.secondary" sx={{ mb:3 }}>
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
                    bgcolor:"#f9fafb", borderRadius:2, p:1.5, mb:1 }}>
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
                  🚀 Enter WealthTrack
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
      localStorage.setItem("wt_token", token);
      window.history.replaceState({}, "", "/");
      fetch(`${API}/auth/me`, { headers:{ Authorization:`Bearer ${token}` } })
        .then(r => r.json()).then(user => {
          setCurrentUser(user); setAuthToken(token);
          setAuthState(onboarded === "false" ? "onboarding" : "app");
        }).catch(() => setAuthState("login"));
      return;
    }
    const saved = localStorage.getItem("wt_token");
    if (saved) {
      fetch(`${API}/auth/me`, { headers:{ Authorization:`Bearer ${saved}` } })
        .then(r => { if (r.ok) return r.json(); throw new Error("bad"); })
        .then(user => {
          setCurrentUser(user); setAuthToken(saved);
          setAuthState(user.is_onboarded ? "app" : "onboarding");
        }).catch(() => { localStorage.removeItem("wt_token"); setAuthState("login"); });
    } else {
      setAuthState("login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("wt_token");
    setAuthState("login"); setAuthToken(null); setCurrentUser(null);
  };

  // Portfolio data
  const [assets, setAssets]           = useState([]);
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

  useEffect(() => {
    if (authState === "app") { fetchAll(); fetchUnreadCount(); fetchProfile(); }
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
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, l] = await Promise.all([
        fetch(`${API}/assets`).then(r => r.json()),
        fetch(`${API}/liabilities`).then(r => r.json()),
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
        fetch(`${API}/analytics/history?days=${historyDays}`).then(r => r.json()),
        fetch(`${API}/analytics/sectors`).then(r => r.json()),
        fetch(`${API}/analytics/dividends`).then(r => r.json()),
      ]);
      setHistory(Array.isArray(h) ? h : []);
      setSectors(Array.isArray(s) ? s : []);
      setDividends(Array.isArray(d) ? d : []);
    } catch { showSnack("Failed to fetch analytics","error"); }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API}/notifications/unread-count`);
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/notifications`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
      fetchUnreadCount();
    } catch {}
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/notifications/profile`);
      const data = await res.json();
      setProfile(data);
      setProfileEdit({ name:data.name||"", email:data.email||"", phone:data.phone||"",
        networth_milestone:data.networth_milestone||1000000, pl_alert_pct:data.pl_alert_pct||5 });
    } catch {}
  };

  const fetchQuickInsights = async () => {
    setInsightsLoading(true);
    try {
      const res  = await fetch(`${API}/advisor/quick-insights`);
      const data = await res.json();
      setQuickInsights(data.insights || []);
    } catch {}
    setInsightsLoading(false);
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      await fetch(`${API}/notifications/profile`, {
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
    setEditMode(false); setEditId(null);
  };

  const handleZerodhaImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append("file", file);
    try {
      showSnack("Importing holdings...", "info");
      const res  = await fetch(`${API}/assets/import-zerodha`, { method:"POST", body:formData });
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
        const body = editItemType==="asset"
          ? { name, buy_price:Number(buyPrice), quantity:Number(quantity), symbol }
          : { name, amount:Number(value), interest:Number(interest), tenure:Number(tenure) };
        await fetch(url, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        showSnack("Updated successfully!");
      } else {
        if (type === "asset") {
          if (!buyPrice || !quantity) return showSnack("Buy price & quantity required","error");
          await fetch(`${API}/assets`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({ name, type:"Equity", buy_price:Number(buyPrice), quantity:Number(quantity), symbol })
          });
        } else {
          await fetch(`${API}/liabilities`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({ name, amount:Number(value), interest:Number(interest), tenure:Number(tenure) })
          });
        }
        showSnack("Added successfully!");
      }
      resetForm(); setOpen(false); fetchAll();
    } catch { showSnack("Something went wrong","error"); }
  };

  const handleDelete = async (endpoint, id) => {
    await fetch(`${API}/${endpoint}/${id}`, { method:"DELETE" });
    showSnack("Deleted"); fetchAll();
  };

  const handleAddDividend = async () => {
    if (!divAssetId || !divAmount || !divDate) return showSnack("Fill all fields","error");
    try {
      await fetch(`${API}/analytics/dividends`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ asset_id:Number(divAssetId), amount:Number(divAmount), received_date:divDate, notes:divNotes })
      });
      showSnack("Dividend added!"); setDivOpen(false); setDivAssetId(""); setDivAmount(""); setDivNotes("");
      fetchAnalytics();
    } catch { showSnack("Failed to add dividend","error"); }
  };

  const handleUpdateTarget = async () => {
    if (!targetAsset) return;
    try {
      await fetch(`${API}/analytics/target/${targetAsset.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ target_pct:Number(targetPct) })
      });
      showSnack("Target updated!"); setTargetOpen(false); fetchAll();
    } catch { showSnack("Failed to update target","error"); }
  };

  const handleUpdateSector = async () => {
    if (!sectorEditAsset) return;
    try {
      await fetch(`${API}/analytics/sector/${sectorEditAsset.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
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
      const res  = await fetch(`${API}/advisor/chat`, {
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

  const exportCSV = () => {
    const rows = [
      ["Type","Name","Buy Price","Qty","Current Value","Symbol","Interest","Tenure"],
      ...assets.map(a => ["Asset",a.name,a.buy_price,a.quantity,(a.current_price*a.quantity).toFixed(2),a.symbol||"","",""]),
      ...liabilities.map(l => ["Liability",l.name,l.amount,"","","",(l.interest||""),l.tenure||""])
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "portfolio.csv"; a.click();
    showSnack("CSV exported!"); setExportAnchor(null);
  };

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
        <Typography variant="h5" fontWeight={800}>WealthTrack</Typography>
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
  const StatCard = ({ icon, label, value, sub, color="#6366f1", bg="#f5f3ff" }) => (
    <Card sx={{ borderRadius:3, border:"1px solid #e5e7eb" }}>
      <CardContent>
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight:600, letterSpacing:0.5 }}>{label}</Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color, mt:0.5 }}>{value}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor:bg, color, width:44, height:44 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const AssetCard = ({ a }) => {
    const invested = a.buy_price * a.quantity;
    const cv       = a.current_price * a.quantity;
    const profit   = cv - invested;
    const pct      = invested > 0 ? ((profit/invested)*100).toFixed(1) : 0;
    const ppct     = networth.totalAssets > 0 ? ((cv/networth.totalAssets)*100).toFixed(1) : 0;
    const drift    = a.target_pct > 0 ? (Number(ppct) - Number(a.target_pct)).toFixed(1) : null;
    return (
      <Card sx={{ mb:2, borderRadius:3, border:"1px solid #e5e7eb" }}>
        <CardContent>
          <Box sx={{ display:"flex", justifyContent:"space-between" }}>
            <Box sx={{ flex:1 }}>
              <Box sx={{ display:"flex", gap:1, mb:0.5, alignItems:"center", flexWrap:"wrap" }}>
                <Typography fontWeight={700}>{a.name}</Typography>
                {a.symbol && <Chip label={a.symbol} size="small" sx={{ bgcolor:"#ede9fe", color:"#6366f1", fontWeight:600, fontSize:11 }} />}
                {a.sector && a.sector !== "Unknown" && <Chip label={a.sector} size="small" sx={{ bgcolor:"#f0fdf4", color:"#16a34a", fontSize:11 }} />}
              </Box>
              <Box sx={{ display:"flex", gap:1, mb:1, flexWrap:"wrap" }}>
                <Chip label={a.type||"Equity"} size="small" variant="outlined" />
                <Chip label={`${ppct}% of portfolio`} size="small" sx={{ bgcolor:"#f3f4f6" }} />
                {drift !== null && (
                  <Chip label={`${drift>0?"▲":"▼"} ${Math.abs(drift)}% drift`} size="small"
                    sx={{ bgcolor:Math.abs(drift)>5?"#fef2f2":"#fffbeb",
                      color:Math.abs(drift)>5?"#ef4444":"#f59e0b", fontWeight:600 }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">Invested: {formatINR(invested)}</Typography>
              <Box sx={{ display:"flex", alignItems:"center", gap:0.5, mt:0.5 }}>
                {profit >= 0
                  ? <TrendingUpIcon fontSize="small" sx={{ color:"#10b981" }} />
                  : <TrendingDownIcon fontSize="small" sx={{ color:"#ef4444" }} />}
                <Typography variant="body2" fontWeight={600} sx={{ color:profit>=0?"#10b981":"#ef4444" }}>
                  {profit>=0?"+":""}{formatINR(profit)} ({pct}%)
                </Typography>
              </Box>
              {a.last_updated && (
                <Typography variant="caption" color="text.secondary" sx={{ mt:0.5, display:"block" }}>
                  🕐 {new Date(a.last_updated).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}
                </Typography>
              )}
              <LinearProgress variant="determinate" value={Math.min(Number(ppct),100)}
                sx={{ mt:1.5, borderRadius:2, height:5, bgcolor:"#f3f4f6",
                  "& .MuiLinearProgress-bar":{ bgcolor:"#6366f1" } }} />
              {a.target_pct > 0 && <>
                <LinearProgress variant="determinate" value={Math.min(Number(a.target_pct),100)}
                  sx={{ mt:0.5, borderRadius:2, height:3, bgcolor:"#f3f4f6",
                    "& .MuiLinearProgress-bar":{ bgcolor:"#f59e0b", opacity:0.6 } }} />
                <Typography variant="caption" color="text.secondary">Target: {a.target_pct}% · Current: {ppct}%</Typography>
              </>}
            </Box>
            <Box sx={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:1 }}>
              <Typography variant="h6" fontWeight={800}>{formatINR(cv)}</Typography>
              <Box sx={{ display:"flex", flexWrap:"wrap", justifyContent:"flex-end" }}>
                <Tooltip title="Set Sector">
                  <IconButton size="small" onClick={() => { setSectorEditAsset(a); setSectorEditVal(a.sector||"Unknown"); setSectorOpen(true); }} sx={{ color:"#10b981" }}>
                    <AccountBalanceIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Set Target %">
                  <IconButton size="small" onClick={() => { setTargetAsset(a); setTargetPct(a.target_pct||""); setTargetOpen(true); }} sx={{ color:"#f59e0b" }}>
                    <TrackChangesIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <IconButton size="small" onClick={() => handleOpen("edit",a,"asset")} sx={{ color:"#6366f1" }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete("assets",a.id)} sx={{ color:"#ef4444" }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
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
      <Card sx={{ mb:2, borderRadius:3, border:"1px solid #fecaca" }}>
        <CardContent>
          <Box sx={{ display:"flex", justifyContent:"space-between" }}>
            <Box sx={{ flex:1 }}>
              <Typography fontWeight={700} sx={{ mb:0.5 }}>{l.name}</Typography>
              <Box sx={{ display:"flex", gap:1, mb:1 }}>
                <Chip label="Loan" size="small" sx={{ bgcolor:"#fef2f2", color:"#ef4444", fontWeight:600 }} />
                <Chip label={`${lpct}% of debt`} size="small" sx={{ bgcolor:"#f3f4f6" }} />
              </Box>
              {l.interest > 0 && <Typography variant="body2" color="text.secondary">{l.interest}% p.a. · {l.tenure} yrs</Typography>}
              {emi > 0 && <>
                <Typography variant="body2" fontWeight={600} sx={{ mt:0.5 }}>EMI: {formatINR(emi)}/mo</Typography>
                <Typography variant="body2" color="text.secondary">Total Interest: {formatINR(totalInt)}</Typography>
              </>}
              <LinearProgress variant="determinate" value={Math.min(Number(lpct),100)}
                sx={{ mt:1.5, borderRadius:2, height:5, bgcolor:"#f3f4f6",
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
        <Grid container spacing={2} sx={{ mb:3 }}>
          <Grid item xs={6}>
            <StatCard icon={<TrendingUpIcon />} label="TOTAL P&L" value={`${gainPct}%`}
              sub={formatINR(totalGain)} color={totalGain>=0?"#10b981":"#ef4444"} bg={totalGain>=0?"#ecfdf5":"#fef2f2"} />
          </Grid>
          <Grid item xs={6}>
            <StatCard icon={<SavingsIcon />} label="DIVIDENDS" value={formatINR(totalDividends)}
              sub={`${formatINR(totalDivThisYear)} this year`} color="#8b5cf6" bg="#f5f3ff" />
          </Grid>
        </Grid>

        {driftAlerts.length > 0 && (
          <Card sx={{ mb:3, borderRadius:3, border:"1px solid #fde68a", bgcolor:"#fffbeb" }}>
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
        <Card sx={{ mb:3, borderRadius:3 }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
              <Typography variant="subtitle1" fontWeight={700}>📈 Net Worth History</Typography>
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
                      await fetch(`${API}/analytics/snapshot`, { method:"POST" });
                      fetchAnalytics(); showSnack("📸 Snapshot saved!");
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
                  "Liabilities": +Number(h.total_liabilities).toFixed(0),
                }))}>
                  <defs>
                    <linearGradient id="networthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize:11 }} />
                  <YAxis tickFormatter={v => formatINR(v)} tick={{ fontSize:10 }} />
                  <ReTooltip formatter={v => formatINR(v)} contentStyle={{ borderRadius:10, fontSize:12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="Assets" stroke="#10b981" fill="url(#assetsGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Net Worth" stroke="#6366f1" fill="url(#networthGrad)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Liabilities" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sector Allocation */}
        <Card sx={{ mb:3, borderRadius:3 }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1 }}>
              <Typography variant="subtitle1" fontWeight={700}>🏭 Sector Allocation</Typography>
              <Button size="small" variant="outlined"
                sx={{ borderColor:"#6366f1", color:"#6366f1", fontWeight:600, borderRadius:2 }}
                onClick={async () => {
                  const res = await fetch(`${API}/analytics/auto-sector`, { method:"POST" });
                  const data = await res.json();
                  showSnack(data.message || "Sectors assigned!"); fetchAll(); fetchAnalytics();
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
        <Card sx={{ mb:3, borderRadius:3 }}>
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
                    <Box sx={{ position:"relative", height:8, bgcolor:"#f3f4f6", borderRadius:4 }}>
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
        <Card sx={{ mb:3, borderRadius:3 }}>
          <CardContent>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
              <Typography variant="subtitle1" fontWeight={700}>💰 Dividend Tracker</Typography>
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
                              await fetch(`${API}/analytics/dividends/${d.id}`, { method:"DELETE" });
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
        <Card sx={{ mb:3, borderRadius:3 }}>
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
                <Box key={i} sx={{ mb:1.5, p:1.5, bgcolor:"#f9fafb", borderRadius:2 }}>
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
            <Box sx={{ p:2, borderBottom:"1px solid #f3f4f6" }}>
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
                            : <Typography sx={{ fontSize:12, fontWeight:700, color:"#6b7280" }}>
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
                      <Box sx={{ p:1.5, bgcolor:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:2 }}>
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
            <Box sx={{ p:2, borderTop:"1px solid #f3f4f6", display:"flex", gap:1 }}>
              <TextField fullWidth size="small" placeholder="Ask about your portfolio..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendChatMessage(); }}}
                sx={{ "& .MuiOutlinedInput-root":{ borderRadius:3 } }} />
              <IconButton onClick={sendChatMessage} disabled={!chatInput.trim()||chatLoading}
                sx={{ bgcolor:"#6366f1", color:"white", borderRadius:2, px:2,
                  "&:hover":{ bgcolor:"#4f46e5" },
                  "&:disabled":{ bgcolor:"#e5e7eb", color:"#9ca3af" } }}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
            {chatMessages.length > 0 && (
              <Box sx={{ px:2, pb:1.5 }}>
                <Button size="small" onClick={() => setChatMessages([])}
                  sx={{ color:"#9ca3af", fontSize:11 }}>Clear conversation</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <Box sx={{ background:"#f9fafb", minHeight:"100vh" }}>

      {/* Top Bar */}
      <Paper elevation={0} sx={{ position:"sticky", top:0, zIndex:100, borderBottom:"1px solid #e5e7eb", bgcolor:"white" }}>
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", px:2, py:1.5 }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
            <Avatar sx={{ bgcolor:"#6366f1", width:34, height:34 }}><AccountBalanceWalletIcon fontSize="small" /></Avatar>
            <Typography variant="h6" fontWeight={800} sx={{ color:"#6366f1" }}>WealthTrack</Typography>
          </Box>
          <Box sx={{ display:"flex", gap:0.5, alignItems:"center" }}>
            <input type="file" accept=".xlsx,.csv" ref={fileInputRef} style={{ display:"none" }} onChange={handleZerodhaImport} />
            <Tooltip title="Import Zerodha"><IconButton size="small" onClick={() => fileInputRef.current.click()}><UploadFileIcon /></IconButton></Tooltip>
            <Tooltip title="Refresh prices"><IconButton size="small" onClick={fetchAll} disabled={loading}><RefreshIcon /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton size="small" onClick={e => setExportAnchor(e.currentTarget)}><DownloadIcon /></IconButton></Tooltip>
            <Tooltip title="Notifications">
              <IconButton size="small" onClick={() => { fetchNotifications(); setNotifOpen(true); }}>
                <Badge badgeContent={unreadCount} color="error" max={9}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton size="small" onClick={() => setProfileOpen(true)}>
                {currentUser?.avatar
                  ? <Box component="img" src={currentUser.avatar} alt="avatar"
                      sx={{ width:28, height:28, borderRadius:"50%", border:"2px solid #6366f1" }} />
                  : <Avatar sx={{ width:28, height:28, bgcolor:"#6366f1", fontSize:13, fontWeight:700 }}>
                      {(currentUser?.name||profile.name)?.charAt(0)?.toUpperCase()||"U"}
                    </Avatar>
                }
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {loading && <LinearProgress sx={{ height:2 }} />}
        <Box sx={{ display:"flex", borderTop:"1px solid #f3f4f6", overflowX:"auto" }}>
          {["dashboard","assets","liabilities","analytics"].map(tab => (
            <Button key={tab} onClick={() => setActiveTab(tab)}
              sx={{ flex:1, py:1, borderRadius:0, textTransform:"capitalize", fontWeight:600, fontSize:12,
                color:activeTab===tab?"#6366f1":"#9ca3af",
                borderBottom:activeTab===tab?"2px solid #6366f1":"2px solid transparent" }}>
              {tab}
            </Button>
          ))}
        </Box>
      </Paper>

      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
        <MenuItem onClick={exportCSV}>📊 Export CSV</MenuItem>
        <MenuItem onClick={exportPDF}>📄 Export PDF</MenuItem>
      </Menu>

      <Container maxWidth="sm" sx={{ py:3 }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && <>
          <Card sx={{ mb:3, borderRadius:4, background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow:"0 8px 32px rgba(99,102,241,0.3)" }}>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ color:"rgba(255,255,255,0.8)", fontWeight:600, fontSize:12, letterSpacing:1 }}>NET WORTH · ₹ INR</Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color:"white", mt:0.5 }}>{formatINR(networth.netWorth)}</Typography>
              <Box sx={{ display:"flex", gap:1, mt:1.5, flexWrap:"wrap" }}>
                <Chip label={`${totalGain>=0?"▲":"▼"} ${formatINR(Math.abs(totalGain))} P&L`} size="small" sx={{ bgcolor:"rgba(255,255,255,0.2)", color:"white", fontWeight:600 }} />
                <Chip label={`${gainPct}% returns`} size="small" sx={{ bgcolor:"rgba(255,255,255,0.2)", color:"white", fontWeight:600 }} />
              </Box>
            </CardContent>
          </Card>
          <Grid container spacing={2} sx={{ mb:3 }}>
            <Grid item xs={6}><StatCard icon={<TrendingUpIcon />} label="TOTAL ASSETS" value={formatINR(networth.totalAssets)} sub={`${assets.length} holdings`} color="#10b981" bg="#ecfdf5" /></Grid>
            <Grid item xs={6}><StatCard icon={<CreditCardIcon />} label="LIABILITIES" value={formatINR(networth.totalLiabilities)} sub={`${liabilities.length} loans`} color="#ef4444" bg="#fef2f2" /></Grid>
            <Grid item xs={6}><StatCard icon={<BalanceIcon />} label="DEBT RATIO" value={`${debtRatio}%`} sub={debtRatio<40?"✅ Healthy":"⚠️ Risky"} color="#f59e0b" bg="#fffbeb" /></Grid>
            <Grid item xs={6}><StatCard icon={<AccountBalanceIcon />} label="INVESTED" value={formatINR(totalInvested)} sub="cost basis" color="#6366f1" bg="#f5f3ff" /></Grid>
          </Grid>
          {assets.length > 0 && (
            <Card sx={{ mb:3, borderRadius:3 }}>
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
          <Card sx={{ mb:3, borderRadius:3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb:1 }}>Overview</Typography>
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
          <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
            <Typography variant="h6" fontWeight={700}>Assets ({assets.length})</Typography>
            <Chip label={formatINR(networth.totalAssets)} sx={{ bgcolor:"#ecfdf5", color:"#10b981", fontWeight:700 }} />
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

        {/* ANALYTICS */}
        {activeTab === "analytics" && <AnalyticsTab />}

        {/* AI ADVISOR tab removed - now floating */}

      </Container>

      {/* FAB */}
      <Fab onClick={() => handleOpen("add")}
        sx={{ position:"fixed", bottom:28, right:24, bgcolor:"#6366f1", color:"white",
          boxShadow:"0 4px 20px rgba(99,102,241,0.4)", "&:hover":{ bgcolor:"#4f46e5" } }}>
        <AddIcon />
      </Fab>

      {/* AI Advisor FAB */}
      <Fab onClick={() => setAiOpen(true)}
        sx={{ position:"fixed", bottom:28, right:88, bgcolor:"white", color:"#6366f1",
          boxShadow:"0 4px 20px rgba(99,102,241,0.35)", border:"2px solid #6366f1",
          "&:hover":{ bgcolor:"#f5f3ff" } }}>
        <SmartToyIcon />
      </Fab>

      {/* AI Advisor Drawer */}
      <Drawer anchor="right" open={aiOpen} onClose={() => setAiOpen(false)}
        PaperProps={{ sx:{ width:{ xs:"100vw", sm:400 }, display:"flex", flexDirection:"column" } }}>

        {/* Header */}
        <Box sx={{ p:2, background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
            <Avatar sx={{ bgcolor:"rgba(255,255,255,0.2)", width:36, height:36 }}>
              <SmartToyIcon sx={{ color:"white", fontSize:20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color:"white", lineHeight:1.2 }}>
                AI Portfolio Advisor
              </Typography>
              <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.8)" }}>
                Powered by Gemini · Live portfolio data
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setAiOpen(false)} sx={{ color:"white" }}>✕</IconButton>
        </Box>

        {/* Quick Insights horizontal scroll */}
        {quickInsights.length > 0 && (
          <Box sx={{ px:1.5, pt:1.5, display:"flex", gap:1, overflowX:"auto",
            pb:1, borderBottom:"1px solid #f3f4f6",
            "&::-webkit-scrollbar":{ display:"none" } }}>
            {quickInsights.map((ins,i) => {
              const CMAP = { positive:"#10b981", warning:"#f59e0b", action:"#6366f1", info:"#8b5cf6" };
              const IMAP = { positive:"✅", warning:"⚠️", action:"🎯", info:"💡" };
              return (
                <Box key={i} sx={{ minWidth:160, p:1.2, borderRadius:2, flexShrink:0,
                  bgcolor:"#f9fafb", border:"1px solid #e5e7eb" }}>
                  <Typography variant="caption" fontWeight={700}
                    sx={{ color:CMAP[ins.type]||"#6366f1", display:"block", mb:0.3 }}>
                    {IMAP[ins.type]||"💡"} {ins.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color:"#6b7280", fontSize:10, lineHeight:1.4 }}>
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
                  <Box sx={{ maxWidth:"80%", p:1.5, borderRadius:2,
                    bgcolor:msg.role==="user"?"#6366f1":"#f9fafb",
                    border:msg.role==="assistant"?"1px solid #e5e7eb":"none" }}>
                    <Typography variant="body2"
                      sx={{ color:msg.role==="user"?"white":"#111827",
                        whiteSpace:"pre-wrap", lineHeight:1.6 }}>
                      {msg.content}
                    </Typography>
                  </Box>
                  {msg.role === "user" && (
                    <Avatar sx={{ bgcolor:"#e5e7eb", width:28, height:28, ml:1, mt:0.5, flexShrink:0 }}>
                      {currentUser?.avatar
                        ? <Box component="img" src={currentUser.avatar} sx={{ width:28, height:28, borderRadius:"50%" }} />
                        : <Typography sx={{ fontSize:12, fontWeight:700, color:"#6b7280" }}>
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
                  <Box sx={{ p:1.5, bgcolor:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:2 }}>
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
        <Box sx={{ p:2, borderTop:"1px solid #e5e7eb", display:"flex", flexDirection:"column", gap:1 }}>
          {chatMessages.length > 0 && (
            <Button size="small" onClick={() => setChatMessages([])}
              sx={{ color:"#9ca3af", fontSize:11, alignSelf:"flex-start", p:0 }}>
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
              sx={{ bgcolor:"#6366f1", color:"white", borderRadius:2,
                "&:hover":{ bgcolor:"#4f46e5" },
                "&:disabled":{ bgcolor:"#e5e7eb", color:"#9ca3af" } }}>
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
                  onClick={async () => { await fetch(`${API}/notifications/read-all`,{method:"PUT"}); fetchNotifications(); }}>
                  Mark all read
                </Button>
                <Button size="small" sx={{ fontSize:11, color:"#ef4444" }}
                  onClick={async () => { await fetch(`${API}/notifications/clear-all`,{method:"DELETE"}); fetchNotifications(); }}>
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
                              onClick={async () => { await fetch(`${API}/notifications/${n.id}/read`,{method:"PUT"}); fetchNotifications(); }}>
                              <CheckCircleIcon sx={{ fontSize:16, color:"#10b981" }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" sx={{ p:0.3 }}
                            onClick={async () => { await fetch(`${API}/notifications/${n.id}`,{method:"DELETE"}); fetchNotifications(); }}>
                            <DeleteIcon sx={{ fontSize:16, color:"#9ca3af" }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display:"block", mt:0.5, lineHeight:1.5 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color:"#9ca3af", fontSize:10, mt:0.5, display:"block" }}>
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
                await fetch(`${API}/notifications/run-checks`, { method:"POST" });
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
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb:2, color:"#374151" }}>👤 Personal Info</Typography>
            <TextField label="Name" fullWidth sx={{ mb:2 }} value={profileEdit.name}
              onChange={e => setProfileEdit(p => ({...p, name:e.target.value}))} />
            <TextField label="Email" fullWidth sx={{ mb:2 }} value={profileEdit.email}
              onChange={e => setProfileEdit(p => ({...p, email:e.target.value}))} />
            <TextField label="Phone" fullWidth sx={{ mb:3 }} value={profileEdit.phone}
              onChange={e => setProfileEdit(p => ({...p, phone:e.target.value}))} />
            <Divider sx={{ mb:2 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb:2, color:"#374151" }}>🔔 Alert Settings</Typography>
            <TextField label="Net Worth Milestone (₹)" type="number" fullWidth sx={{ mb:2 }}
              value={profileEdit.networth_milestone}
              helperText="Get notified when net worth crosses this amount"
              onChange={e => setProfileEdit(p => ({...p, networth_milestone:e.target.value}))} />
            <TextField label="P&L Alert Threshold (%)" type="number" fullWidth sx={{ mb:3 }}
              value={profileEdit.pl_alert_pct}
              helperText="Get notified when portfolio gain/loss crosses this %"
              onChange={e => setProfileEdit(p => ({...p, pl_alert_pct:e.target.value}))} />
            <Divider sx={{ mb:2 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb:1.5, color:"#374151" }}>📋 Notification Schedule</Typography>
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
        <DialogTitle sx={{ fontWeight:700 }}>{editMode ? "✏️ Edit Entry" : "➕ Add Entry"}</DialogTitle>
        <DialogContent sx={{ pt:1 }}>
          {!editMode && (
            <ToggleButtonGroup value={type} exclusive onChange={(e,v) => v && setType(v)} fullWidth sx={{ mb:2 }}>
              <ToggleButton value="asset" sx={{ fontWeight:600 }}>Asset</ToggleButton>
              <ToggleButton value="liability" sx={{ fontWeight:600 }}>Liability</ToggleButton>
            </ToggleButtonGroup>
          )}
          <TextField label="Name" fullWidth sx={{ mb:2 }} value={name} onChange={e => setName(e.target.value)} />
          {((!editMode && type==="asset") || (editMode && editItemType==="asset")) && <>
            <TextField label="Buy Price (₹)" type="number" fullWidth sx={{ mb:2 }} value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
            <TextField label="Quantity" type="number" fullWidth sx={{ mb:2 }} value={quantity} onChange={e => setQuantity(e.target.value)} />
            <Box sx={{ position:"relative" }}>
              <TextField label="Stock Symbol (e.g. TCS.NS)" fullWidth value={symbolSearch} autoComplete="off"
                helperText="Type to search NSE / BSE / US stocks"
                onChange={async (e) => {
                  const val = e.target.value;
                  setSymbolSearch(val); setSymbol(val);
                  if (val.length >= 2) {
                    try {
                      const res  = await fetch(`${API}/search-stocks?q=${val}`);
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
                      sx={{ px:2, py:1.2, cursor:"pointer", borderBottom:"1px solid #f3f4f6",
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
        <DialogTitle sx={{ fontWeight:700 }}>💰 Log Dividend</DialogTitle>
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
        <DialogTitle sx={{ fontWeight:700 }}>🎯 Set Target Allocation</DialogTitle>
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
        <DialogTitle sx={{ fontWeight:700 }}>🏭 Set Sector</DialogTitle>
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

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({...s,open:false}))}
        anchorOrigin={{ vertical:"bottom", horizontal:"center" }}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius:2 }}>{snack.msg}</Alert>
      </Snackbar>

    </Box>
  );
}