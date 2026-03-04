import { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Avatar, Stepper, Step, StepLabel, Chip
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function OnboardingPage({ token, user, onComplete }) {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [milestone, setMilestone] = useState("100000");
  const [plAlert, setPlAlert] = useState("5");

  const MILESTONES = [
    { label:"₹50K",  value:"50000" },
    { label:"₹1L",   value:"100000" },
    { label:"₹5L",   value:"500000" },
    { label:"₹10L",  value:"1000000" },
    { label:"₹50L",  value:"5000000" },
    { label:"₹1Cr",  value:"10000000" },
  ];

  const handleFinish = async () => {
    try {
      await fetch("http://localhost:5000/auth/complete-onboarding", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          token,
          networth_milestone: Number(milestone),
          pl_alert_pct: Number(plAlert),
          phone
        })
      });
      onComplete();
    } catch (err) {
      console.error("Onboarding error:", err);
    }
  };

  const steps = ["Welcome", "Alert Settings", "Ready!"];

  return (
    <Box sx={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#6366f1,#8b5cf6)"
    }}>
      <Card sx={{ borderRadius:4, maxWidth:460, width:"90%", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <CardContent sx={{ p:4 }}>

          <Stepper activeStep={step} sx={{ mb:4 }}>
            {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
          </Stepper>

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <Box sx={{ textAlign:"center" }}>
              <Avatar sx={{ bgcolor:"#6366f1", width:80, height:80, mx:"auto", mb:2, fontSize:40 }}>
                {user?.name?.charAt(0)?.toUpperCase() || "W"}
              </Avatar>
              <Typography variant="h5" fontWeight={800} sx={{ color:"#6366f1", mb:1 }}>
                Welcome, {user?.name?.split(" ")[0]}! 👋
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb:3 }}>
                Let's set up your WealthTrack account in just 2 steps.
              </Typography>
              {user?.avatar && (
                <Box component="img" src={user.avatar} alt="avatar"
                  sx={{ width:60, height:60, borderRadius:"50%", mb:2, mx:"auto", display:"block" }} />
              )}
              <Box sx={{ bgcolor:"#f5f3ff", borderRadius:2, p:2, mb:3, textAlign:"left" }}>
                <Typography variant="body2" fontWeight={600} sx={{ color:"#6366f1" }}>✅ Account created</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Button fullWidth variant="contained" size="large" onClick={() => setStep(1)}
                sx={{ bgcolor:"#6366f1", borderRadius:3, fontWeight:700, py:1.5,
                  "&:hover":{ bgcolor:"#4f46e5" } }}>
                Let's Get Started →
              </Button>
            </Box>
          )}

          {/* Step 1 — Alert Settings */}
          {step === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb:0.5 }}>🔔 Set Your Alerts</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb:3 }}>
                We'll notify you when these thresholds are crossed.
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb:1 }}>
                🎯 Net Worth Milestone
              </Typography>
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:1, mb:2 }}>
                {MILESTONES.map(m => (
                  <Chip key={m.value} label={m.label} onClick={() => setMilestone(m.value)}
                    sx={{ cursor:"pointer", fontWeight:600,
                      bgcolor: milestone===m.value?"#6366f1":"#f3f4f6",
                      color:   milestone===m.value?"white":"#374151" }} />
                ))}
              </Box>
              <TextField label="Custom amount (₹)" type="number" fullWidth sx={{ mb:3 }}
                value={milestone} onChange={e => setMilestone(e.target.value)}
                helperText="Notify me when my net worth crosses this amount" />

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb:1 }}>
                📊 P&L Alert Threshold
              </Typography>
              <Box sx={{ display:"flex", gap:1, mb:2, flexWrap:"wrap" }}>
                {["1","2","5","10","15","20"].map(v => (
                  <Chip key={v} label={`${v}%`} onClick={() => setPlAlert(v)}
                    sx={{ cursor:"pointer", fontWeight:600,
                      bgcolor: plAlert===v?"#6366f1":"#f3f4f6",
                      color:   plAlert===v?"white":"#374151" }} />
                ))}
              </Box>
              <TextField label="Phone (optional)" fullWidth sx={{ mb:3 }}
                value={phone} onChange={e => setPhone(e.target.value)}
                helperText="For future SMS alerts (optional)" />

              <Box sx={{ display:"flex", gap:2 }}>
                <Button fullWidth variant="outlined" onClick={() => setStep(0)}
                  sx={{ borderColor:"#6366f1", color:"#6366f1", borderRadius:3, fontWeight:700 }}>
                  Back
                </Button>
                <Button fullWidth variant="contained" onClick={() => setStep(2)}
                  sx={{ bgcolor:"#6366f1", borderRadius:3, fontWeight:700,
                    "&:hover":{ bgcolor:"#4f46e5" } }}>
                  Next →
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2 — Ready */}
          {step === 2 && (
            <Box sx={{ textAlign:"center" }}>
              <Typography fontSize={64} sx={{ mb:1 }}>🎉</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color:"#6366f1", mb:1 }}>
                You're all set!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb:3 }}>
                Here's your setup summary:
              </Typography>
              <Box sx={{ textAlign:"left", mb:3 }}>
                {[
                  { icon:"🎯", label:"Net Worth Milestone", value:
                    Number(milestone)>=10000000 ? `₹${(Number(milestone)/10000000).toFixed(1)}Cr` :
                    Number(milestone)>=100000   ? `₹${(Number(milestone)/100000).toFixed(0)}L` :
                    Number(milestone)>=1000     ? `₹${(Number(milestone)/1000).toFixed(0)}K` :
                    `₹${milestone}` },
                  { icon:"📊", label:"P&L Alert",          value:`${plAlert}% gain/loss` },
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
                  sx={{ borderColor:"#6366f1", color:"#6366f1", borderRadius:3, fontWeight:700 }}>
                  Back
                </Button>
                <Button fullWidth variant="contained" size="large" onClick={handleFinish}
                  sx={{ bgcolor:"#6366f1", borderRadius:3, fontWeight:700, py:1.5,
                    "&:hover":{ bgcolor:"#4f46e5" } }}>
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