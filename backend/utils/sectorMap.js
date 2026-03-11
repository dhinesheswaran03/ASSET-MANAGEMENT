// Shared sector map used by assets.js, analytics.js
// 200+ NSE/BSE stocks

const SECTOR_MAP = {
  // IT
  "TCS.NS":"IT","INFY.NS":"IT","HCLTECH.NS":"IT","WIPRO.NS":"IT","TECHM.NS":"IT",
  "LTIM.NS":"IT","MPHASIS.NS":"IT","COFORGE.NS":"IT","PERSISTENT.NS":"IT",
  "OFSS.NS":"IT","KPITTECH.NS":"IT","TATAELXSI.NS":"IT","HEXAWARE.NS":"IT",
  "LTTS.NS":"IT","CYIENT.NS":"IT","SONATSOFTW.NS":"IT","MASTEK.NS":"IT",
  "ZENSARTECH.NS":"IT","MINDTREE.NS":"IT","NIITTECH.NS":"IT",
  // Banking
  "HDFCBANK.NS":"Banking","ICICIBANK.NS":"Banking","SBIN.NS":"Banking",
  "KOTAKBANK.NS":"Banking","AXISBANK.NS":"Banking","INDUSINDBK.NS":"Banking",
  "BANDHANBNK.NS":"Banking","FEDERALBNK.NS":"Banking","IDFCFIRSTB.NS":"Banking",
  "YESBANK.NS":"Banking","RBLBANK.NS":"Banking","CANBK.NS":"Banking",
  "BANKBARODA.NS":"Banking","PNB.NS":"Banking","UNIONBANK.NS":"Banking",
  "INDIANB.NS":"Banking","CENTRALBK.NS":"Banking","IOB.NS":"Banking",
  "UCOBANK.NS":"Banking","KARURVYSYA.NS":"Banking","DCBBANK.NS":"Banking",
  "CSBBANK.NS":"Banking","MAHABANK.NS":"Banking",
  // Finance & NBFC
  "BAJFINANCE.NS":"Finance","BAJAJFINSV.NS":"Finance","HDFCLIFE.NS":"Finance",
  "SBILIFE.NS":"Finance","ICICIGI.NS":"Finance","ICICIPRULI.NS":"Finance",
  "CHOLAFIN.NS":"Finance","MUTHOOTFIN.NS":"Finance","MANAPPURAM.NS":"Finance",
  "SHRIRAMFIN.NS":"Finance","LICHSGFIN.NS":"Finance","PNBHOUSING.NS":"Finance",
  "CANFINHOME.NS":"Finance","RECLTD.NS":"Finance","PFC.NS":"Finance",
  "IRFC.NS":"Finance","M&MFIN.NS":"Finance","SUNDARAM.NS":"Finance",
  // Energy & Oil
  "RELIANCE.NS":"Energy","ONGC.NS":"Energy","NTPC.NS":"Energy",
  "POWERGRID.NS":"Energy","COALINDIA.NS":"Energy","BPCL.NS":"Energy",
  "IOC.NS":"Energy","HINDPETRO.NS":"Energy","GAIL.NS":"Energy",
  "PETRONET.NS":"Energy","TATAPOWER.NS":"Energy","ADANIGREEN.NS":"Energy",
  "ADANITRANS.NS":"Energy","TORNTPOWER.NS":"Energy","CESC.NS":"Energy",
  "NHPC.NS":"Energy","SJVN.NS":"Energy","IREDA.NS":"Energy",
  // Auto
  "TATAMOTORS.NS":"Auto","M&M.NS":"Auto","BAJAJ-AUTO.NS":"Auto",
  "HEROMOTOCO.NS":"Auto","MARUTI.NS":"Auto","EICHERMOT.NS":"Auto",
  "ASHOKLEY.NS":"Auto","TVSMOTOR.NS":"Auto","MOTHERSON.NS":"Auto",
  "BOSCHLTD.NS":"Auto","EXIDEIND.NS":"Auto","MRF.NS":"Auto",
  "CEATLTD.NS":"Auto","APOLLOTYRE.NS":"Auto","BALKRISIND.NS":"Auto",
  "SUNDRMFAST.NS":"Auto","SUPRAJIT.NS":"Auto","AMARAJABAT.NS":"Auto",
  // FMCG
  "HINDUNILVR.NS":"FMCG","ITC.NS":"FMCG","NESTLEIND.NS":"FMCG",
  "BRITANNIA.NS":"FMCG","DABUR.NS":"FMCG","MARICO.NS":"FMCG",
  "GODREJCP.NS":"FMCG","COLPAL.NS":"FMCG","EMAMILTD.NS":"FMCG",
  "TATACONSUM.NS":"FMCG","VARUNBEV.NS":"FMCG","UBL.NS":"FMCG",
  "MCDOWELL-N.NS":"FMCG","RADICO.NS":"FMCG","HATSUN.NS":"FMCG",
  // Pharma
  "SUNPHARMA.NS":"Pharma","DRREDDY.NS":"Pharma","CIPLA.NS":"Pharma",
  "DIVISLAB.NS":"Pharma","ZYDUSLIFE.NS":"Pharma","BIOCON.NS":"Pharma",
  "AUROPHARMA.NS":"Pharma","LUPIN.NS":"Pharma","TORNTPHARM.NS":"Pharma",
  "IPCALAB.NS":"Pharma","ALKEM.NS":"Pharma","ABBOTINDIA.NS":"Pharma",
  "PFIZER.NS":"Pharma","GLENMARK.NS":"Pharma","NATCOPHARM.NS":"Pharma",
  "GRANULES.NS":"Pharma","LAURUSLABS.NS":"Pharma","APLLTD.NS":"Pharma",
  // Infrastructure & Construction
  "LT.NS":"Infrastructure","ADANIENT.NS":"Infrastructure","ADANIPORTS.NS":"Infrastructure",
  "ULTRACEMCO.NS":"Infrastructure","AMBUJACEM.NS":"Infrastructure",
  "ACC.NS":"Infrastructure","SHREECEM.NS":"Infrastructure","RAMCOCEM.NS":"Infrastructure",
  "JKCEMENT.NS":"Infrastructure","IRB.NS":"Infrastructure","NBCC.NS":"Infrastructure",
  "RVNL.NS":"Infrastructure","IRCON.NS":"Infrastructure","ENGINERSIN.NS":"Infrastructure",
  "GMRINFRA.NS":"Infrastructure","KNR.NS":"Infrastructure",
  // Realty
  "DLF.NS":"Realty","GODREJPROP.NS":"Realty","OBEROIRLTY.NS":"Realty",
  "PRESTIGE.NS":"Realty","PHOENIXLTD.NS":"Realty","SOBHA.NS":"Realty",
  "BRIGADE.NS":"Realty","MAHLIFE.NS":"Realty","SUNTECK.NS":"Realty",
  // Metals & Mining
  "JSWSTEEL.NS":"Metals","TATASTEEL.NS":"Metals","HINDALCO.NS":"Metals",
  "VEDL.NS":"Metals","SAIL.NS":"Metals","NMDC.NS":"Metals",
  "NATIONALUM.NS":"Metals","HINDCOPPER.NS":"Metals","MOIL.NS":"Metals",
  "WELSPUNIND.NS":"Metals","RATNAMANI.NS":"Metals",
  // Telecom
  "BHARTIARTL.NS":"Telecom","IDEA.NS":"Telecom","INDUSTOWER.NS":"Telecom",
  "TEJASNET.NS":"Telecom","STLTECH.NS":"Telecom","TTML.NS":"Telecom",
  // Consumer & Retail
  "TITAN.NS":"Consumer","ASIANPAINT.NS":"Consumer","BERGER.NS":"Consumer",
  "KANSAINER.NS":"Consumer","PIDILITIND.NS":"Consumer","HAVELLS.NS":"Consumer",
  "VOLTAS.NS":"Consumer","WHIRLPOOL.NS":"Consumer","BLUESTAR.NS":"Consumer",
  "CROMPTON.NS":"Consumer","DMART.NS":"Consumer","TRENT.NS":"Consumer",
  "SHOPERSTOP.NS":"Consumer","ABFRL.NS":"Consumer","PAGEIND.NS":"Consumer",
  "MANYAVAR.NS":"Consumer",
  // Healthcare
  "APOLLOHOSP.NS":"Healthcare","FORTIS.NS":"Healthcare","MAXHEALTH.NS":"Healthcare",
  "MEDANTA.NS":"Healthcare","NH.NS":"Healthcare","NARAYANHRU.NS":"Healthcare",
  "THYROCARE.NS":"Healthcare","METROPOLIS.NS":"Healthcare",
  // Chemicals
  "DEEPAKNTR.NS":"Chemicals","NAVINFLUOR.NS":"Chemicals","FLUOROCHEM.NS":"Chemicals",
  "FINEORG.NS":"Chemicals","GALAXYSURF.NS":"Chemicals","ATUL.NS":"Chemicals",
  "VINATIORGA.NS":"Chemicals","BALAMINES.NS":"Chemicals","ALKYLAMINE.NS":"Chemicals",
  // Agri
  "UPL.NS":"Agri","PIIND.NS":"Agri","RALLIS.NS":"Agri","DHANUKA.NS":"Agri",
  "KAVERI.NS":"Agri","GNFC.NS":"Agri",
  // Index ETFs & Gold
  "NIFTYBEES.NS":"Index Fund","JUNIORBEES.NS":"Index Fund","BANKBEES.NS":"Index Fund",
  "GOLDBEES.NS":"Gold","SILVERBEES.NS":"Silver","LIQUIDBEES.NS":"Cash",
  // BSE variants — same stocks with .BO suffix
  "RELIANCE.BO":"Energy","TCS.BO":"IT","HDFCBANK.BO":"Banking","INFY.BO":"IT",
  "ICICIBANK.BO":"Banking","SBIN.BO":"Banking","WIPRO.BO":"IT","HCLTECH.BO":"IT",
  "AXISBANK.BO":"Banking","KOTAKBANK.BO":"Banking","TATAMOTORS.BO":"Auto",
  "MARUTI.BO":"Auto","SUNPHARMA.BO":"Pharma","BAJFINANCE.BO":"Finance",
  "LT.BO":"Infrastructure","ITC.BO":"FMCG","HINDUNILVR.BO":"FMCG",
  "BHARTIARTL.BO":"Telecom","TITAN.BO":"Consumer","NTPC.BO":"Energy",
  "ONGC.BO":"Energy","COALINDIA.BO":"Energy","ADANIENT.BO":"Infrastructure",
  "JSWSTEEL.BO":"Metals","TATASTEEL.BO":"Metals","DLF.BO":"Realty",
};

// Smart keyword guesser from company name
const guessSector = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("bank") || n.includes("banking"))                                    return "Banking";
  if (n.includes("finance") || n.includes("finserv") || n.includes("capital") || n.includes("lending") || n.includes("credit") || n.includes("nbfc")) return "Finance";
  if (n.includes("pharma") || n.includes("drug") || n.includes("biocon") || n.includes("medic") || n.includes(" lab") || n.includes("labs"))  return "Pharma";
  if (n.includes("hospital") || n.includes("health") || n.includes("clinic") || n.includes("diagnostic")) return "Healthcare";
  if (n.includes("software") || n.includes("infosy") || n.includes("digital") || n.includes("cyber") || n.includes("tech") && !n.includes("biotech")) return "IT";
  if (n.includes("auto") || n.includes("motor") || n.includes("vehicle") || n.includes("tyre") || n.includes("ancillar")) return "Auto";
  if (n.includes("steel") || n.includes("metal") || n.includes("alumin") || n.includes("copper") || n.includes("zinc") || n.includes("iron") || n.includes("mining")) return "Metals";
  if (n.includes("cement") || n.includes("construction") || n.includes("infra") || n.includes("engineer") || n.includes("build") || n.includes("road") || n.includes("rail") || n.includes("power grid")) return "Infrastructure";
  if (n.includes("power") || n.includes("energy") || n.includes("oil") || n.includes("gas") || n.includes("petro") || n.includes("coal") || n.includes("solar") || n.includes("wind")) return "Energy";
  if (n.includes("telecom") || n.includes("airtel") || n.includes("vodafone") || n.includes("tower") || n.includes("jio")) return "Telecom";
  if (n.includes("paint") || n.includes("fmcg") || n.includes("food") || n.includes("beverage") || n.includes("dairy") || n.includes("biscuit") || n.includes("soap") || n.includes("consumer goods")) return "FMCG";
  if (n.includes("realty") || n.includes("real estate") || n.includes("property") || n.includes("housing") || n.includes("developer")) return "Realty";
  if (n.includes("chemical") || n.includes("agro") || n.includes("pesticide") || n.includes("fertilizer")) return "Chemicals";
  if (n.includes("retail") || n.includes("mart") || n.includes("fashion") || n.includes("apparel") || n.includes("jewel") || n.includes("titan")) return "Consumer";
  if (n.includes("gold") || n.includes("sgb") || n.includes("sovereign gold"))        return "Gold";
  if (n.includes("nifty") || n.includes("sensex") || n.includes("index") || n.includes("etf") || n.includes("bees")) return "Index Fund";
  if (n.includes("mutual fund") || n.includes(" mf") || n.includes("fund"))           return "Mutual Fund";
  if (n.includes("fd") || n.includes("fixed deposit") || n.includes("recurring") || n.includes("bond") || n.includes("debenture")) return "Fixed Income";
  if (n.includes("cash") || n.includes("savings") || n.includes("liquid"))            return "Cash";
  return null;
};

// Main function — type takes priority, then symbol map, then name keywords
const getSector = (type, name, symbol) => {
  if (type === "Gold")        return "Gold";
  if (type === "Cash")        return "Cash";
  if (type === "FD")          return "Fixed Income";
  if (type === "MutualFund")  return "Mutual Fund";
  if (type === "Other")       return "Other";

  // Exact symbol match
  if (symbol && SECTOR_MAP[symbol]) return SECTOR_MAP[symbol];

  // Try stripping exchange suffix and re-adding both
  if (symbol) {
    const base = symbol.split(".")[0];
    if (SECTOR_MAP[base + ".NS"]) return SECTOR_MAP[base + ".NS"];
    if (SECTOR_MAP[base + ".BO"]) return SECTOR_MAP[base + ".BO"];
  }

  // Keyword guess from name
  const guessed = guessSector(name);
  if (guessed) return guessed;

  return "Unknown";
};

module.exports = { getSector, SECTOR_MAP, guessSector };