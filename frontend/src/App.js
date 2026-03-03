import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BalanceIcon from "@mui/icons-material/Balance";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function App() {
  const API = "http://localhost:5000";

  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [networth, setNetworth] = useState({});
  const [open, setOpen] = useState(false);

  const [type, setType] = useState("asset");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [interest, setInterest] = useState("");
  const [tenure, setTenure] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const a = await fetch(`${API}/assets`).then(r => r.json());
    const l = await fetch(`${API}/liabilities`).then(r => r.json());
    const n = await fetch(`${API}/networth`).then(r => r.json());

    setAssets(a);
    setLiabilities(l);
    const totalAssets = a.reduce((sum, asset) => {
  return sum + (asset.current_price * asset.quantity);
}, 0);

const totalLiabilities = l.reduce((sum, liability) => {
  return sum + Number(liability.amount);
}, 0);

setNetworth({
  totalAssets,
  totalLiabilities,
  netWorth: totalAssets - totalLiabilities
});
  };

  const handleAdd = async () => {
    if (!name) return;

    if (type === "asset") {

  if (!buyPrice || !quantity || !currentPrice) return;

  await fetch(`${API}/assets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      type: "Equity",
      buy_price: Number(buyPrice),
      quantity: Number(quantity),
      current_price: Number(currentPrice)
    })
  });
} else if (type === "liability") {

      await fetch(`${API}/liabilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: Number(value),
          interest: Number(interest),
          tenure: Number(tenure)
        })
      });
    }

    setName("");
    setValue("");
    setBuyPrice("");
    setQuantity("");
    setCurrentPrice("");
    setInterest("");
    setTenure("");
    setOpen(false);
    fetchAll();
  };

  const debtRatio =
    networth.totalAssets > 0
      ? ((networth.totalLiabilities / networth.totalAssets) * 100).toFixed(1)
      : 0;

  return (
    <Box sx={{ background: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="sm">

        {/* NET WORTH HERO */}
        <Card
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 4,
            background: "#e8f5e9",
            border: "1px solid #c8e6c9"
          }}
        >
          <Typography variant="subtitle2">
            NET WORTH · ₹ INR
          </Typography>

          <Typography
            variant="h3"
            sx={{
  fontWeight: 700,
  color: networth.netWorth >= 0 ? "#2e7d32" : "#c62828"
}}
          >
            ₹{networth.netWorth || 0}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            Take your first snapshot →
          </Typography>
        </Card>

        {/* SUMMARY */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ display: "flex", alignItems: "center" }}>
            <AccountBalanceIcon sx={{ mr: 2, color: "#2e7d32" }} />
            <Box>
              <Typography variant="subtitle2">TOTAL ASSETS</Typography>
              <Typography variant="h6">
                ₹{networth.totalAssets || 0}
              </Typography>
              <Typography variant="body2">
                {assets.length} assets
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ display: "flex", alignItems: "center" }}>
            <CreditCardIcon sx={{ mr: 2, color: "#c62828" }} />
            <Box>
              <Typography variant="subtitle2">TOTAL LIABILITIES</Typography>
              <Typography variant="h6" sx={{ color: "#c62828" }}>
                ₹{networth.totalLiabilities || 0}
              </Typography>
              <Typography variant="body2">
                {liabilities.length} loans
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ display: "flex", alignItems: "center" }}>
            <BalanceIcon sx={{ mr: 2, color: "#2e7d32" }} />
            <Box>
              <Typography variant="subtitle2">DEBT RATIO</Typography>
              <Typography variant="h6">
                {debtRatio}%
              </Typography>
              <Typography variant="body2">
                {debtRatio < 40 ? "Healthy" : "Risky"}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ mb: 4, borderRadius: 3 }}>
  <CardContent>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Portfolio Allocation
    </Typography>

    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={assets.map(a => ({
            name: a.name,
            value: a.current_price * a.quantity
          }))}
          dataKey="value"
          outerRadius={80}
        >
          {assets.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={[
                "#2e7d32",
                "#1565c0",
                "#6a1b9a",
                "#ef6c00",
                "#00897b"
              ][index % 5]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
        {/* ASSETS */}
<Typography variant="h6" sx={{ mb: 2 }}>
  Assets
</Typography>

{assets.length === 0 && (
  <Typography sx={{ mb: 2 }} color="text.secondary">
    No assets added yet
  </Typography>
)}

{assets.map(a => {

  const invested = a.buy_price * a.quantity;
const currentValue = a.current_price * a.quantity;
const profit = currentValue - invested;
const profitPercent =
  invested > 0 ? ((profit / invested) * 100).toFixed(1) : 0;

  return (
    <Card key={a.id} sx={{ mb: 2, borderRadius: 3 }}>
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 600 }}>
            {a.name}
          </Typography>

          <Chip
            label={a.type || "Equity"}
            size="small"
            sx={{ mt: 1 }}
          />

          <Typography variant="body2" sx={{ mt: 1 }}>
  Invested: ₹{invested}
</Typography>

<Typography
  variant="body2"
  sx={{
    color: profit >= 0 ? "#2e7d32" : "#c62828"
  }}
>
  {profit >= 0 ? "+" : ""}
  ₹{profit} ({profitPercent}%)
</Typography>

<Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
  {networth.totalAssets > 0
    ? ((currentValue / networth.totalAssets) * 100).toFixed(1)
    : 0}
  % of portfolio
</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  <Typography sx={{ fontWeight: 600 }}>
    ₹{currentValue}
  </Typography>

  <IconButton
    size="small"
    onClick={async () => {
      await fetch(`${API}/assets/${a.id}`, {
        method: "DELETE"
      });
      fetchAll();
    }}
  >
    <DeleteIcon fontSize="small" />
  </IconButton>
</Box>
      </CardContent>
    </Card>
  );
})}

{/* LIABILITIES */}
<Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
  Liabilities
</Typography>

{liabilities.length === 0 && (
  <Typography sx={{ mb: 2 }} color="text.secondary">
    No liabilities added yet
  </Typography>
)}

{liabilities.map(l => {

  const P = Number(l.amount);
  const annualRate = Number(l.interest);
  const years = Number(l.tenure);

  let emi = 0;
  let totalInterest = 0;

  if (annualRate && years) {
    const r = annualRate / 12 / 100;
    const n = years * 12;

    emi =
      (P * r * Math.pow(1 + r, n)) /
      (Math.pow(1 + r, n) - 1);

    totalInterest = emi * n - P;
  }

  return (
    <Card key={l.id} sx={{ mb: 2, borderRadius: 3 }}>
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 600 }}>
            {l.name}
          </Typography>

          <Chip
            label="Loan"
            size="small"
            sx={{
              mt: 1,
              background: "#ffebee",
              color: "#c62828"
            }}
          />

          <Typography
            variant="body2"
            sx={{ mt: 1, color: "text.secondary" }}
          >
            {networth.totalLiabilities > 0
              ? ((l.amount / networth.totalLiabilities) * 100).toFixed(1)
              : 0}
            % of liabilities
          </Typography>

          {emi > 0 && (
            <>
              <Typography variant="body2" sx={{ mt: 1 }}>
                EMI: ₹{emi.toFixed(0)} / month
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total Interest: ₹{totalInterest.toFixed(0)}
              </Typography>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 600, color: "#c62828" }}>
            ₹{l.amount}
          </Typography>

          <IconButton
            size="small"
            onClick={async () => {
              await fetch(`${API}/liabilities/${l.id}`, {
                method: "DELETE"
              });
              fetchAll();
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
})}
      </Container>

      {/* FLOATING ADD BUTTON */}
      <Fab
        color="success"
        sx={{ position: "fixed", bottom: 30, right: 30 }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* ADD DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Entry</DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(e, val) => val && setType(val)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="asset">Asset</ToggleButton>
            <ToggleButton value="liability">Liability</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Name"
            fullWidth
            sx={{ mb: 2 }}
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          {type === "asset" && (
  <>
    <TextField
      label="Buy Price"
      type="number"
      fullWidth
      sx={{ mt: 2 }}
      value={buyPrice}
      onChange={e => setBuyPrice(e.target.value)}
    />

    <TextField
      label="Quantity"
      type="number"
      fullWidth
      sx={{ mt: 2 }}
      value={quantity}
      onChange={e => setQuantity(e.target.value)}
    />

    <TextField
      label="Current Price"
      type="number"
      fullWidth
      sx={{ mt: 2 }}
      value={currentPrice}
      onChange={e => setCurrentPrice(e.target.value)}
    />
  </>
)}
          {type === "liability" && (
  <>
    <TextField
      label="Interest Rate (%)"
      type="number"
      fullWidth
      sx={{ mt: 2 }}
      value={interest}
      onChange={e => setInterest(e.target.value)}
    />

    <TextField
      label="Tenure (Years)"
      type="number"
      fullWidth
      sx={{ mt: 2 }}
      value={tenure}
      onChange={e => setTenure(e.target.value)}
    />
  </>
)}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;