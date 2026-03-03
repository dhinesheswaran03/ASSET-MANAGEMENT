import { useEffect, useState, useRef } from "react";
import {
  Container, Typography, Card, CardContent, Box, Fab, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Button,
  ToggleButton, ToggleButtonGroup, Chip, IconButton, Avatar,
  LinearProgress, Menu, MenuItem, Tooltip, Snackbar, Alert, Grid, Paper
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
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
  XAxis, YAxis, CartesianGrid
} from "recharts";

const API = "http://localhost:5000";
const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899"];

const formatINR = (val) => {
  const n = Number(val) || 0;
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(2)}L`;
  if (n >= 1000)     return `₹${(n/1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};

export default function App() {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [networth, setNetworth] = useState({ totalAssets:0, totalLiabilities:0, netWorth:0 });
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open:false, msg:"", severity:"success" });
  const [exportAnchor, setExportAnchor] = useState(null);

  // Form state
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editItemType, setEditItemType] = useState("asset");
  const [type, setType] = useState("asset");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [interest, setInterest] = useState("");
  const [tenure, setTenure] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [symbol, setSymbol] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, l] = await Promise.all([
        fetch(`${API}/assets`).then(r => r.json()),
        fetch(`${API}/liabilities`).then(r => r.json()),
      ]);
      const aArr = Array.isArray(a) ? a : [];
      const lArr = Array.isArray(l) ? l : [];
      setAssets(aArr);
      setLiabilities(lArr);
      const totalAssets = aArr.reduce((s,x) => s + (x.current_price * x.quantity), 0);
      const totalLiabilities = lArr.reduce((s,x) => s + Number(x.amount), 0);
      setNetworth({ totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities });
    } catch { showSnack("Failed to fetch data","error"); }
    setLoading(false);
  };

  const showSnack = (msg, severity="success") => setSnack({ open:true, msg, severity });

  const resetForm = () => {
    setName(""); setValue(""); setBuyPrice(""); setQuantity("");
    setSymbol(""); setInterest(""); setTenure("");
    setEditMode(false); setEditId(null);
  };

  const handleZerodhaImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      showSnack("Importing holdings...", "info");
      const res = await fetch(`${API}/assets/import-zerodha`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.imported !== undefined) {
        showSnack(`✅ Imported ${data.imported} holdings! (${data.skipped} skipped)`, "success");
        fetchAll();
      } else {
        showSnack(data.error || "Import failed", "error");
      }
    } catch {
      showSnack("Import failed", "error");
    }
    e.target.value = "";
  };

  const handleOpen = (mode="add", item=null, itemType="asset") => {
    resetForm();
    if (mode === "edit" && item) {
      setEditMode(true); setEditId(item.id); setEditItemType(itemType); setType(itemType);
      setName(item.name || "");
      if (itemType === "asset") {
        setBuyPrice(item.buy_price || ""); setQuantity(item.quantity || ""); setSymbol(item.symbol || "");
      } else {
        setValue(item.amount || ""); setInterest(item.interest || ""); setTenure(item.tenure || "");
      }
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name) return showSnack("Name is required","error");
    try {
      if (editMode) {
        const url = editItemType === "asset" ? `${API}/assets/${editId}` : `${API}/liabilities/${editId}`;
        const body = editItemType === "asset"
          ? { name, buy_price: Number(buyPrice), quantity: Number(quantity), symbol }
          : { name, amount: Number(value), interest: Number(interest), tenure: Number(tenure) };
        await fetch(url, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
        showSnack("Updated successfully!");
      } else {
        if (type === "asset") {
          if (!buyPrice || !quantity) return showSnack("Buy price & quantity required","error");
          await fetch(`${API}/assets`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ name, type:"Equity", buy_price:Number(buyPrice), quantity:Number(quantity), symbol })
          });
        } else {
          await fetch(`${API}/liabilities`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ name, amount:Number(value), interest:Number(interest), tenure:Number(tenure) })
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

  const exportCSV = () => {
    const rows = [
      ["Type","Name","Buy Price","Qty","Current Value","Symbol","Interest","Tenure"],
      ...assets.map(a => ["Asset",a.name,a.buy_price,a.quantity,(a.current_price*a.quantity).toFixed(2),a.symbol||"","",""]),
      ...liabilities.map(l => ["Liability",l.name,l.amount,"","","",(l.interest||""),l.tenure||""])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "portfolio.csv"; a.click();
    showSnack("CSV exported!"); setExportAnchor(null);
  };

  const exportPDF = () => {
    const win = window.open("","_blank");
    const totalInvested = assets.reduce((s,a) => s + a.buy_price * a.quantity, 0);
    const totalGain = networth.totalAssets - totalInvested;
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
    <table><tr><th>Name</th><th>Symbol</th><th>Buy Price</th><th>Qty</th><th>Value</th><th>P&L</th></tr>
    ${assets.map(a => {
      const cv=a.current_price*a.quantity, pl=cv-a.buy_price*a.quantity;
      return `<tr><td>${a.name}</td><td>${a.symbol||"-"}</td><td>₹${a.buy_price}</td><td>${a.quantity}</td><td>₹${cv.toFixed(0)}</td><td style="color:${pl>=0?"#10b981":"#ef4444"}">${pl>=0?"+":""}₹${pl.toFixed(0)}</td></tr>`;
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

  const debtRatio = networth.totalAssets > 0 ? ((networth.totalLiabilities/networth.totalAssets)*100).toFixed(1) : 0;
  const totalInvested = assets.reduce((s,a) => s + a.buy_price * a.quantity, 0);
  const totalGain = networth.totalAssets - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain/totalInvested)*100).toFixed(1) : 0;

  const totalEMI = liabilities.reduce((s,l) => {
    const P=Number(l.amount), r=l.interest/12/100, n=l.tenure*12;
    return s + ((r&&n)?(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):0);
  }, 0);

  // ── Sub-components ────────────────────────────────────────────────────────

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
    const cv = a.current_price * a.quantity;
    const profit = cv - invested;
    const pct = invested > 0 ? ((profit/invested)*100).toFixed(1) : 0;
    const ppct = networth.totalAssets > 0 ? ((cv/networth.totalAssets)*100).toFixed(1) : 0;
    return (
      <Card sx={{ mb:2, borderRadius:3, border:"1px solid #e5e7eb" }}>
        <CardContent>
          <Box sx={{ display:"flex", justifyContent:"space-between" }}>
            <Box sx={{ flex:1 }}>
              <Box sx={{ display:"flex", gap:1, mb:0.5, alignItems:"center" }}>
                <Typography fontWeight={700}>{a.name}</Typography>
                {a.symbol && <Chip label={a.symbol} size="small" sx={{ bgcolor:"#ede9fe", color:"#6366f1", fontWeight:600, fontSize:11 }} />}
              </Box>
              <Box sx={{ display:"flex", gap:1, mb:1 }}>
                <Chip label={a.type||"Equity"} size="small" variant="outlined" />
                <Chip label={`${ppct}% of portfolio`} size="small" sx={{ bgcolor:"#f3f4f6" }} />
              </Box>
              <Typography variant="body2" color="text.secondary">Invested: {formatINR(invested)}</Typography>
              <Box sx={{ display:"flex", alignItems:"center", gap:0.5, mt:0.5 }}>
                {profit >= 0
                  ? <TrendingUpIcon fontSize="small" sx={{ color:"#10b981" }} />
                  : <TrendingDownIcon fontSize="small" sx={{ color:"#ef4444" }} />}
                <Typography variant="body2" fontWeight={600} sx={{ color: profit>=0?"#10b981":"#ef4444" }}>
                  {profit>=0?"+":""}{formatINR(profit)} ({pct}%)
                </Typography>
              </Box>
              {a.last_updated && (
                <Typography variant="caption" color="text.secondary" sx={{ mt:0.5, display:"block" }}>
                  🕐 Updated: {new Date(a.last_updated).toLocaleString("en-IN", { dateStyle:"short", timeStyle:"short" })}
                </Typography>
              )}
              <LinearProgress variant="determinate" value={Math.min(Number(ppct),100)}
                sx={{ mt:1.5, borderRadius:2, height:5, bgcolor:"#f3f4f6", "& .MuiLinearProgress-bar":{ bgcolor:"#6366f1" } }} />
            </Box>
            <Box sx={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:1 }}>
              <Typography variant="h6" fontWeight={800}>{formatINR(cv)}</Typography>
              <Box>
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
              {l.interest > 0 && (
                <Typography variant="body2" color="text.secondary">{l.interest}% p.a. · {l.tenure} yrs</Typography>
              )}
              {emi > 0 && <>
                <Typography variant="body2" fontWeight={600} sx={{ mt:0.5 }}>EMI: {formatINR(emi)}/mo</Typography>
                <Typography variant="body2" color="text.secondary">Total Interest: {formatINR(totalInt)}</Typography>
              </>}
              <LinearProgress variant="determinate" value={Math.min(Number(lpct),100)}
                sx={{ mt:1.5, borderRadius:2, height:5, bgcolor:"#f3f4f6", "& .MuiLinearProgress-bar":{ bgcolor:"#ef4444" } }} />
            </Box>
            <Box sx={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:1 }}>
              <Typography variant="h6" fontWeight={800} sx={{ color:"#ef4444" }}>{formatINR(l.amount)}</Typography>
              <Box>
                <IconButton size="small" onClick={() => handleOpen("edit",l,"liability")} sx={{ color:"#6366f1" }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete("liabilities",l.id)} sx={{ color:"#ef4444" }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ background:"#f9fafb", minHeight:"100vh" }}>

      {/* ── Top Bar ── */}
      <Paper elevation={0} sx={{ position:"sticky", top:0, zIndex:100, borderBottom:"1px solid #e5e7eb", bgcolor:"white" }}>
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", px:2, py:1.5 }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
            <Avatar sx={{ bgcolor:"#6366f1", width:34, height:34 }}>
              <AccountBalanceWalletIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6" fontWeight={800} sx={{ color:"#6366f1" }}>WealthTrack</Typography>
          </Box>
          <Box sx={{ display:"flex", gap:0.5 }}>
            <input
              type="file"
              accept=".xlsx,.csv"
              ref={fileInputRef}
              style={{ display:"none" }}
              onChange={handleZerodhaImport}
            />
            <Tooltip title="Import Zerodha Holdings">
              <IconButton size="small" onClick={() => fileInputRef.current.click()}>
                <UploadFileIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh live prices">
              <IconButton size="small" onClick={fetchAll} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export data">
              <IconButton size="small" onClick={e => setExportAnchor(e.currentTarget)}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {loading && <LinearProgress sx={{ height:2 }} />}
        <Box sx={{ display:"flex", borderTop:"1px solid #f3f4f6", overflowX:"auto" }}>
          {["dashboard","assets","liabilities","analytics"].map(tab => (
            <Button key={tab} onClick={() => setActiveTab(tab)}
              sx={{
                flex:1, py:1, borderRadius:0, textTransform:"capitalize", fontWeight:600, fontSize:13,
                color: activeTab===tab ? "#6366f1":"#9ca3af",
                borderBottom: activeTab===tab ? "2px solid #6366f1":"2px solid transparent"
              }}>
              {tab}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* ── Export Menu ── */}
      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
        <MenuItem onClick={exportCSV}>📊 Export CSV</MenuItem>
        <MenuItem onClick={exportPDF}>📄 Export PDF</MenuItem>
      </Menu>

      {/* ── Main Content ── */}
      <Container maxWidth="sm" sx={{ py:3 }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && <>
          <Card sx={{ mb:3, borderRadius:4, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow:"0 8px 32px rgba(99,102,241,0.3)" }}>
            <CardContent sx={{ p:3 }}>
              <Typography sx={{ color:"rgba(255,255,255,0.8)", fontWeight:600, fontSize:12, letterSpacing:1 }}>
                NET WORTH · ₹ INR
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color:"white", mt:0.5 }}>
                {formatINR(networth.netWorth)}
              </Typography>
              <Box sx={{ display:"flex", gap:1, mt:1.5, flexWrap:"wrap" }}>
                <Chip label={`${totalGain>=0?"▲":"▼"} ${formatINR(Math.abs(totalGain))} P&L`} size="small"
                  sx={{ bgcolor:"rgba(255,255,255,0.2)", color:"white", fontWeight:600 }} />
                <Chip label={`${gainPct}% returns`} size="small"
                  sx={{ bgcolor:"rgba(255,255,255,0.2)", color:"white", fontWeight:600 }} />
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={2} sx={{ mb:3 }}>
            <Grid item xs={6}>
              <StatCard icon={<TrendingUpIcon />} label="TOTAL ASSETS" value={formatINR(networth.totalAssets)} sub={`${assets.length} holdings`} color="#10b981" bg="#ecfdf5" />
            </Grid>
            <Grid item xs={6}>
              <StatCard icon={<CreditCardIcon />} label="LIABILITIES" value={formatINR(networth.totalLiabilities)} sub={`${liabilities.length} loans`} color="#ef4444" bg="#fef2f2" />
            </Grid>
            <Grid item xs={6}>
              <StatCard icon={<BalanceIcon />} label="DEBT RATIO" value={`${debtRatio}%`} sub={debtRatio<40?"✅ Healthy":"⚠️ Risky"} color="#f59e0b" bg="#fffbeb" />
            </Grid>
            <Grid item xs={6}>
              <StatCard icon={<AccountBalanceIcon />} label="INVESTED" value={formatINR(totalInvested)} sub="cost basis" color="#6366f1" bg="#f5f3ff" />
            </Grid>
          </Grid>

          {assets.length > 0 && (
  <Card sx={{ mb:3, borderRadius:3 }}>
    <CardContent>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb:1 }}>Portfolio Allocation</Typography>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={assets.map(a => ({ name:a.name, value:+(a.current_price*a.quantity).toFixed(0) }))}
            dataKey="value"
            outerRadius={90}
            innerRadius={45}
            paddingAngle={1}
          >
            {assets.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
          </Pie>
          <ReTooltip
            formatter={(value, name) => [formatINR(value), name]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              fontSize: 13,
              fontWeight: 600
            }}
          />
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
                  {name:"Assets",   value:+networth.totalAssets.toFixed(0)},
                  {name:"Liabilities", value:+networth.totalLiabilities.toFixed(0)},
                  {name:"Net Worth",value:+networth.netWorth.toFixed(0)}
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
            : assets.map(a => <AssetCard key={a.id} a={a} />)
          }
        </>}

        {/* LIABILITIES */}
        {activeTab === "liabilities" && <>
          <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
            <Typography variant="h6" fontWeight={700}>Liabilities ({liabilities.length})</Typography>
            <Chip label={formatINR(networth.totalLiabilities)} sx={{ bgcolor:"#fef2f2", color:"#ef4444", fontWeight:700 }} />
          </Box>
          {liabilities.length === 0
            ? <Typography color="text.secondary" sx={{ textAlign:"center", py:5 }}>No liabilities yet. Tap + to add.</Typography>
            : liabilities.map(l => <LiabilityCard key={l.id} l={l} />)
          }
        </>}

        {/* ANALYTICS */}
        {activeTab === "analytics" && <>
          <Grid container spacing={2} sx={{ mb:3 }}>
            <Grid item xs={6}>
              <StatCard icon={<TrendingUpIcon />} label="TOTAL P&L" value={`${gainPct}%`} sub={formatINR(totalGain)}
                color={totalGain>=0?"#10b981":"#ef4444"} bg={totalGain>=0?"#ecfdf5":"#fef2f2"} />
            </Grid>
            <Grid item xs={6}>
              <StatCard icon={<CreditCardIcon />} label="TOTAL EMI/MO" value={formatINR(totalEMI)} sub="combined" color="#f59e0b" bg="#fffbeb" />
            </Grid>
          </Grid>

          {assets.length > 0 && (
            <Card sx={{ mb:3, borderRadius:3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb:2 }}>Asset-wise P&L</Typography>
                {assets.map((a,i) => {
                  const inv=a.buy_price*a.quantity, cur=a.current_price*a.quantity;
                  const pl=cur-inv, pct=inv>0?((pl/inv)*100).toFixed(1):0;
                  return (
                    <Box key={i} sx={{ mb:2 }}>
                      <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{a.name}</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color:pl>=0?"#10b981":"#ef4444" }}>
                          {pl>=0?"+":""}{pct}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.min(Math.abs(Number(pct)),100)}
                        sx={{ borderRadius:2, height:7, bgcolor:"#f3f4f6", "& .MuiLinearProgress-bar":{ bgcolor:pl>=0?"#10b981":"#ef4444" } }} />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb:3, borderRadius:3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb:1 }}>Portfolio Health Score</Typography>
              <Box sx={{ textAlign:"center", py:2 }}>
                {(() => {
                  let score = 100;
                  if (debtRatio > 50) score -= 30; else if (debtRatio > 30) score -= 15;
                  if (totalGain < 0) score -= 20;
                  if (assets.length < 3) score -= 10;
                  score = Math.max(score, 0);
                  const color = score>=70?"#10b981":score>=40?"#f59e0b":"#ef4444";
                  const label = score>=70?"Excellent":score>=40?"Moderate":"Needs Attention";
                  return <>
                    <Typography variant="h2" fontWeight={900} sx={{ color }}>{score}</Typography>
                    <Typography variant="h6" sx={{ color }}>{label}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>
                      Based on debt ratio, returns & diversification
                    </Typography>
                  </>;
                })()}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius:3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb:1 }}>Invested vs Current</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={assets.map(a => ({
                  name: a.name,
                  invested: +(a.buy_price*a.quantity).toFixed(0),
                  current:  +(a.current_price*a.quantity).toFixed(0)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize:11 }} />
                  <YAxis tickFormatter={v => formatINR(v)} tick={{ fontSize:10 }} />
                  <ReTooltip formatter={v => formatINR(v)} />
                  <Bar dataKey="invested" fill="#a5b4fc" radius={[4,4,0,0]} name="Invested" />
                  <Bar dataKey="current"  fill="#6366f1" radius={[4,4,0,0]} name="Current" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>}

      </Container>

      {/* ── FAB ── */}
      <Fab onClick={() => handleOpen("add")}
        sx={{ position:"fixed", bottom:28, right:24, bgcolor:"#6366f1", color:"white",
          boxShadow:"0 4px 20px rgba(99,102,241,0.4)", "&:hover":{ bgcolor:"#4f46e5" } }}>
        <AddIcon />
      </Fab>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight:700 }}>{editMode ? "✏️ Edit Entry" : "➕ Add Entry"}</DialogTitle>
        <DialogContent sx={{ pt:1 }}>
          {!editMode && (
            <ToggleButtonGroup value={type} exclusive onChange={(e,v) => v && setType(v)} fullWidth sx={{ mb:2 }}>
              <ToggleButton value="asset"     sx={{ fontWeight:600 }}>Asset</ToggleButton>
              <ToggleButton value="liability" sx={{ fontWeight:600 }}>Liability</ToggleButton>
            </ToggleButtonGroup>
          )}
          <TextField label="Name" fullWidth sx={{ mb:2 }} value={name} onChange={e => setName(e.target.value)} />
          {((!editMode && type==="asset") || (editMode && editItemType==="asset")) && <>
            <TextField label="Buy Price (₹)" type="number" fullWidth sx={{ mb:2 }} value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
            <TextField label="Quantity"      type="number" fullWidth sx={{ mb:2 }} value={quantity} onChange={e => setQuantity(e.target.value)} />
            <TextField label="Stock Symbol (e.g. TCS.NS)" fullWidth value={symbol} onChange={e => setSymbol(e.target.value)}
              helperText="Optional — used for live price fetching" />
          </>}
          {((!editMode && type==="liability") || (editMode && editItemType==="liability")) && <>
            <TextField label="Loan Amount (₹)"   type="number" fullWidth sx={{ mb:2 }} value={value}    onChange={e => setValue(e.target.value)} />
            <TextField label="Interest Rate (%)"  type="number" fullWidth sx={{ mb:2 }} value={interest} onChange={e => setInterest(e.target.value)} />
            <TextField label="Tenure (Years)"     type="number" fullWidth               value={tenure}   onChange={e => setTenure(e.target.value)} />
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

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(s => ({...s, open:false}))}
        anchorOrigin={{ vertical:"bottom", horizontal:"center" }}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius:2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>

    </Box>
  );
}