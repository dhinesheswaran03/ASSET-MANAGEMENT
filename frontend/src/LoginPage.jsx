import { Box, Button, Typography, Card, CardContent, Avatar } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function LoginPage() {
  return (
    <Box sx={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)"
    }}>
      <Card sx={{ borderRadius:4, p:2, maxWidth:400, width:"90%", textAlign:"center",
        boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <CardContent sx={{ p:4 }}>
          {/* Logo */}
          <Avatar sx={{ bgcolor:"#6366f1", width:72, height:72, mx:"auto", mb:2 }}>
            <AccountBalanceWalletIcon sx={{ fontSize:40 }} />
          </Avatar>
          <Typography variant="h4" fontWeight={900} sx={{ color:"#6366f1", mb:0.5 }}>
            WealthTrack
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb:4 }}>
            Your personal portfolio & net worth tracker
          </Typography>

          {/* Features */}
          {["📈 Track stocks & net worth in real-time",
            "🏭 Sector allocation & drift alerts",
            "💰 Dividend tracker & P&L analytics",
            "🔔 Smart notifications & weekly digest"
          ].map((f,i) => (
            <Box key={i} sx={{ display:"flex", alignItems:"center", gap:1.5, mb:1.5, textAlign:"left" }}>
              <Typography variant="body2" sx={{ color:"#374151" }}>{f}</Typography>
            </Box>
          ))}

          {/* Google Login Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={() => window.location.href = "http://localhost:5000/auth/google"}
            sx={{
              mt:3, py:1.5, borderRadius:3, textTransform:"none",
              bgcolor:"white", color:"#374151", fontWeight:700, fontSize:16,
              border:"1px solid #e5e7eb",
              boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
              "&:hover":{ bgcolor:"#f9fafb", boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }
            }}>
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