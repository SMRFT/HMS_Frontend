/**
 * India Locations Dataset: States, Districts, and Cities/Taluks
 * Specially enriched for Tamil Nadu (Salem, Sankagiri, Namakkal, Erode, etc.) and neighboring regions.
 */

export const INDIAN_STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Puducherry",
  "Maharashtra",
  "Gujarat",
  "Delhi",
  "Goa",
  "Rajasthan",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "West Bengal",
  "Bihar",
  "Punjab",
  "Haryana",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Arunachal Pradesh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Ladakh",
  "Lakshadweep",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura"
];

export const DISTRICTS_BY_STATE = {
  "Tamil Nadu": [
    "Salem",
    "Namakkal",
    "Erode",
    "Dharmapuri",
    "Krishnagiri",
    "Coimbatore",
    "Tiruppur",
    "Karur",
    "Tiruchirappalli",
    "Dindigul",
    "Madurai",
    "Chennai",
    "Chengalpattu",
    "Kanchipuram",
    "Tiruvallur",
    "Vellore",
    "Ranipet",
    "Tirupathur",
    "Tiruvannamalai",
    "Viluppuram",
    "Kallakurichi",
    "Cuddalore",
    "Perambalur",
    "Ariyalur",
    "Mayiladuthurai",
    "Nagapattinam",
    "Tiruvarur",
    "Thanjavur",
    "Pudukkottai",
    "Sivaganga",
    "Ramanathapuram",
    "Virudhunagar",
    "Theni",
    "Thoothukudi",
    "Tirunelveli",
    "Tenkasi",
    "Kanniyakumari",
    "Nilgiris"
  ],
  "Karnataka": [
    "Bengaluru Urban",
    "Bengaluru Rural",
    "Mysuru",
    "Kolar",
    "Chikkaballapura",
    "Tumakuru",
    "Mandya",
    "Hassan",
    "Mangaluru (Dakshina Kannada)",
    "Udupi",
    "Chikkamagaluru",
    "Shivamogga",
    "Ballari",
    "Belagavi",
    "Dharwad",
    "Hubballi",
    "Davangere"
  ],
  "Kerala": [
    "Palakkad",
    "Ernakulam (Kochi)",
    "Thrissur",
    "Malappuram",
    "Kozhikode",
    "Thiruvananthapuram",
    "Kollam",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Wayanad",
    "Kannur",
    "Kasaragod",
    "Pathanamthitta"
  ],
  "Andhra Pradesh": [
    "Chittoor",
    "Tirupati",
    "Nellore",
    "Anantapur",
    "YSR Kadapa",
    "Guntur",
    "Krishna",
    "Visakhapatnam",
    "Kurnool",
    "Prakasam"
  ],
  "Telangana": [
    "Hyderabad",
    "Ranga Reddy",
    "Medchal-Malkajgiri",
    "Warangal",
    "Karimnagar",
    "Nizamabad",
    "Khammam",
    "Nalgonda"
  ],
  "Puducherry": [
    "Puducherry",
    "Karaikal",
    "Mahe",
    "Yanam"
  ]
};

// Comprehensive list of cities, towns, and taluks
export const CITIES_AND_TOWNS = [
  // ─── SALEM DISTRICT ───────────────────────────────────────────────
  { city: "Salem", district: "Salem", state: "Tamil Nadu", aliases: ["Salem City", "Salem Corporation"] },
  { city: "Sankagiri", district: "Salem", state: "Tamil Nadu", aliases: ["Sankari", "Sangagiri", "Sankakiri"] },
  { city: "Attur", district: "Salem", state: "Tamil Nadu", aliases: ["Athur"] },
  { city: "Mettur", district: "Salem", state: "Tamil Nadu", aliases: ["Mettur Dam"] },
  { city: "Omalur", district: "Salem", state: "Tamil Nadu" },
  { city: "Edappadi", district: "Salem", state: "Tamil Nadu", aliases: ["Idappadi"] },
  { city: "Valapady", district: "Salem", state: "Tamil Nadu", aliases: ["Vazhapadi", "Valappadi"] },
  { city: "Yercaud", district: "Salem", state: "Tamil Nadu" },
  { city: "Gangavalli", district: "Salem", state: "Tamil Nadu" },
  { city: "Thalaivasal", district: "Salem", state: "Tamil Nadu" },
  { city: "Kadayampatti", district: "Salem", state: "Tamil Nadu" },
  { city: "Mecheri", district: "Salem", state: "Tamil Nadu" },
  { city: "Jalakandapuram", district: "Salem", state: "Tamil Nadu" },
  { city: "Tharamangalam", district: "Salem", state: "Tamil Nadu" },
  { city: "Ayothiapattinam", district: "Salem", state: "Tamil Nadu" },
  { city: "Karuppur", district: "Salem", state: "Tamil Nadu" },
  { city: "Kannankurichi", district: "Salem", state: "Tamil Nadu" },
  { city: "Nangavalli", district: "Salem", state: "Tamil Nadu" },
  { city: "Pethanaickenpalayam", district: "Salem", state: "Tamil Nadu" },
  { city: "Mallur", district: "Salem", state: "Tamil Nadu" },
  { city: "Panamarathupatti", district: "Salem", state: "Tamil Nadu" },
  { city: "Veeraganur", district: "Salem", state: "Tamil Nadu" },
  { city: "Kolathur", district: "Salem", state: "Tamil Nadu" },
  { city: "Belur", district: "Salem", state: "Tamil Nadu" },
  { city: "Theevattipatti", district: "Salem", state: "Tamil Nadu" },
  { city: "Konganapuram", district: "Salem", state: "Tamil Nadu" },
  { city: "Poolampatti", district: "Salem", state: "Tamil Nadu" },
  { city: "Suramangalam", district: "Salem", state: "Tamil Nadu" },
  { city: "Ammapet", district: "Salem", state: "Tamil Nadu" },
  { city: "Hasthampatti", district: "Salem", state: "Tamil Nadu" },
  { city: "Fairlands", district: "Salem", state: "Tamil Nadu" },
  { city: "Shevapet", district: "Salem", state: "Tamil Nadu" },

  // ─── NAMAKKAL DISTRICT ────────────────────────────────────────────
  { city: "Namakkal", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Tiruchengode", district: "Namakkal", state: "Tamil Nadu", aliases: ["Thiruchengode", "T.Gode"] },
  { city: "Rasipuram", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Paramathi Velur", district: "Namakkal", state: "Tamil Nadu", aliases: ["Velur", "P.Velur"] },
  { city: "Kumarapalayam", district: "Namakkal", state: "Tamil Nadu", aliases: ["Komarapalayam"] },
  { city: "Kolli Hills", district: "Namakkal", state: "Tamil Nadu", aliases: ["Kollimalai"] },
  { city: "Mohanur", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Sendamangalam", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Mallasamudram", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Erumaipatti", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Puduchatram", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Vennandur", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Padaiveedu", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Pandamangalam", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Namagiripettai", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Alampalayam", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Pattanam", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Kabilarmalai", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Kokkarayanpettai", district: "Namakkal", state: "Tamil Nadu" },
  { city: "Pallipalayam", district: "Namakkal", state: "Tamil Nadu" },

  // ─── ERODE DISTRICT ───────────────────────────────────────────────
  { city: "Erode", district: "Erode", state: "Tamil Nadu" },
  { city: "Bhavani", district: "Erode", state: "Tamil Nadu" },
  { city: "Gobichettipalayam", district: "Erode", state: "Tamil Nadu", aliases: ["Gobi"] },
  { city: "Perundurai", district: "Erode", state: "Tamil Nadu" },
  { city: "Sathyamangalam", district: "Erode", state: "Tamil Nadu", aliases: ["Sathy"] },
  { city: "Anthiyur", district: "Erode", state: "Tamil Nadu" },
  { city: "Kodumudi", district: "Erode", state: "Tamil Nadu" },
  { city: "Modakkurichi", district: "Erode", state: "Tamil Nadu" },
  { city: "Chennimalai", district: "Erode", state: "Tamil Nadu" },
  { city: "Nambiyur", district: "Erode", state: "Tamil Nadu" },
  { city: "Bhavanisagar", district: "Erode", state: "Tamil Nadu" },
  { city: "Chithode", district: "Erode", state: "Tamil Nadu" },
  { city: "Sivagiri", district: "Erode", state: "Tamil Nadu" },
  { city: "Appakudal", district: "Erode", state: "Tamil Nadu" },
  { city: "Kanjikovil", district: "Erode", state: "Tamil Nadu" },

  // ─── DHARMAPURI DISTRICT ──────────────────────────────────────────
  { city: "Dharmapuri", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Harur", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Palacode", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Pennagaram", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Pappireddipatti", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Karimangalam", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Nallampalli", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Morappur", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Marandahalli", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Kadathur", district: "Dharmapuri", state: "Tamil Nadu" },
  { city: "Hogenakkal", district: "Dharmapuri", state: "Tamil Nadu" },

  // ─── KRISHNAGIRI DISTRICT ─────────────────────────────────────────
  { city: "Krishnagiri", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Hosur", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Denkanikottai", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Pochampalli", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Uthangarai", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Bargur", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Shoolagiri", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Kelamangalam", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Rayakottai", district: "Krishnagiri", state: "Tamil Nadu" },
  { city: "Kaveripattinam", district: "Krishnagiri", state: "Tamil Nadu" },

  // ─── COIMBATORE DISTRICT ──────────────────────────────────────────
  { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", aliases: ["Kovai"] },
  { city: "Pollachi", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Mettupalayam", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Sulur", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Annur", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Kinathukadavu", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Valparai", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Madukkarai", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Karumathampatti", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Saravanampatti", district: "Coimbatore", state: "Tamil Nadu" },
  { city: "Thondamuthur", district: "Coimbatore", state: "Tamil Nadu" },

  // ─── TIRUPPUR DISTRICT ────────────────────────────────────────────
  { city: "Tiruppur", district: "Tiruppur", state: "Tamil Nadu", aliases: ["Tirupur"] },
  { city: "Avinashi", district: "Tiruppur", state: "Tamil Nadu" },
  { city: "Dharapuram", district: "Tiruppur", state: "Tamil Nadu" },
  { city: "Kangeyam", district: "Tiruppur", state: "Tamil Nadu" },
  { city: "Palladam", district: "Tiruppur", state: "Tamil Nadu" },
  { city: "Udumalaipettai", district: "Tiruppur", state: "Tamil Nadu", aliases: ["Udumalpet"] },
  { city: "Madathukulam", district: "Tiruppur", state: "Tamil Nadu" },
  { city: "Uthukuli", district: "Tiruppur", state: "Tamil Nadu" },
  { city: "Vellakoil", district: "Tiruppur", state: "Tamil Nadu" },

  // ─── KARUR DISTRICT ───────────────────────────────────────────────
  { city: "Karur", district: "Karur", state: "Tamil Nadu" },
  { city: "Kulithalai", district: "Karur", state: "Tamil Nadu" },
  { city: "Aravakurichi", district: "Karur", state: "Tamil Nadu" },
  { city: "Krishnarayapuram", district: "Karur", state: "Tamil Nadu" },
  { city: "Kadavur", district: "Karur", state: "Tamil Nadu" },
  { city: "Manmangalam", district: "Karur", state: "Tamil Nadu" },
  { city: "Pugalur", district: "Karur", state: "Tamil Nadu" },
  { city: "Velayuthampalayam", district: "Karur", state: "Tamil Nadu" },

  // ─── TIRUCHIRAPPALLI DISTRICT ─────────────────────────────────────
  { city: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu", aliases: ["Trichy", "Tiruchi"] },
  { city: "Srirangam", district: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Lalgudi", district: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Manapparai", district: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Musiri", district: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Thuraiyur", district: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Thottiyam", district: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Manachanallur", district: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Tiruverumbur", district: "Tiruchirappalli", state: "Tamil Nadu" },

  // ─── DINDIGUL DISTRICT ────────────────────────────────────────────
  { city: "Dindigul", district: "Dindigul", state: "Tamil Nadu" },
  { city: "Palani", district: "Dindigul", state: "Tamil Nadu" },
  { city: "Kodaikanal", district: "Dindigul", state: "Tamil Nadu" },
  { city: "Oddanchatram", district: "Dindigul", state: "Tamil Nadu" },
  { city: "Nilakottai", district: "Dindigul", state: "Tamil Nadu" },
  { city: "Natham", district: "Dindigul", state: "Tamil Nadu" },
  { city: "Vedasandur", district: "Dindigul", state: "Tamil Nadu" },
  { city: "Batlagundu", district: "Dindigul", state: "Tamil Nadu" },

  // ─── MADURAI DISTRICT ─────────────────────────────────────────────
  { city: "Madurai", district: "Madurai", state: "Tamil Nadu" },
  { city: "Melur", district: "Madurai", state: "Tamil Nadu" },
  { city: "Thirumangalam", district: "Madurai", state: "Tamil Nadu" },
  { city: "Usilampatti", district: "Madurai", state: "Tamil Nadu" },
  { city: "Vadipatti", district: "Madurai", state: "Tamil Nadu" },
  { city: "Peraiyur", district: "Madurai", state: "Tamil Nadu" },
  { city: "Sholavandan", district: "Madurai", state: "Tamil Nadu" },
  { city: "Thirupparankundram", district: "Madurai", state: "Tamil Nadu" },

  // ─── CHENNAI & SURROUNDINGS ───────────────────────────────────────
  { city: "Chennai", district: "Chennai", state: "Tamil Nadu", aliases: ["Madras"] },
  { city: "Tambaram", district: "Chengalpattu", state: "Tamil Nadu" },
  { city: "Chengalpattu", district: "Chengalpattu", state: "Tamil Nadu" },
  { city: "Kanchipuram", district: "Kanchipuram", state: "Tamil Nadu", aliases: ["Kanchi"] },
  { city: "Tiruvallur", district: "Tiruvallur", state: "Tamil Nadu" },
  { city: "Avadi", district: "Tiruvallur", state: "Tamil Nadu" },
  { city: "Poonamallee", district: "Tiruvallur", state: "Tamil Nadu" },
  { city: "Sriperumbudur", district: "Kanchipuram", state: "Tamil Nadu" },
  { city: "Maduranthakam", district: "Chengalpattu", state: "Tamil Nadu" },
  { city: "Maraimalai Nagar", district: "Chengalpattu", state: "Tamil Nadu" },
  { city: "Mahabalipuram", district: "Chengalpattu", state: "Tamil Nadu", aliases: ["Mamallapuram"] },

  // ─── OTHER TAMIL NADU DISTRICT HEADQUARTERS & TOWNS ───────────────
  { city: "Vellore", district: "Vellore", state: "Tamil Nadu" },
  { city: "Ranipet", district: "Ranipet", state: "Tamil Nadu" },
  { city: "Arakkonam", district: "Ranipet", state: "Tamil Nadu" },
  { city: "Tirupathur", district: "Tirupathur", state: "Tamil Nadu" },
  { city: "Vaniyambadi", district: "Tirupathur", state: "Tamil Nadu" },
  { city: "Ambur", district: "Tirupathur", state: "Tamil Nadu" },
  { city: "Tiruvannamalai", district: "Tiruvannamalai", state: "Tamil Nadu" },
  { city: "Arani", district: "Tiruvannamalai", state: "Tamil Nadu" },
  { city: "Viluppuram", district: "Viluppuram", state: "Tamil Nadu" },
  { city: "Tindivanam", district: "Viluppuram", state: "Tamil Nadu" },
  { city: "Kallakurichi", district: "Kallakurichi", state: "Tamil Nadu" },
  { city: "Ulundurpet", district: "Kallakurichi", state: "Tamil Nadu" },
  { city: "Cuddalore", district: "Cuddalore", state: "Tamil Nadu" },
  { city: "Panruti", district: "Cuddalore", state: "Tamil Nadu" },
  { city: "Chidambaram", district: "Cuddalore", state: "Tamil Nadu" },
  { city: "Neyveli", district: "Cuddalore", state: "Tamil Nadu" },
  { city: "Perambalur", district: "Perambalur", state: "Tamil Nadu" },
  { city: "Ariyalur", district: "Ariyalur", state: "Tamil Nadu" },
  { city: "Jayankondam", district: "Ariyalur", state: "Tamil Nadu" },
  { city: "Mayiladuthurai", district: "Mayiladuthurai", state: "Tamil Nadu" },
  { city: "Sirkazhi", district: "Mayiladuthurai", state: "Tamil Nadu" },
  { city: "Nagapattinam", district: "Nagapattinam", state: "Tamil Nadu" },
  { city: "Velankanni", district: "Nagapattinam", state: "Tamil Nadu" },
  { city: "Tiruvarur", district: "Tiruvarur", state: "Tamil Nadu" },
  { city: "Mannargudi", district: "Tiruvarur", state: "Tamil Nadu" },
  { city: "Thanjavur", district: "Thanjavur", state: "Tamil Nadu", aliases: ["Tanjore"] },
  { city: "Kumbakonam", district: "Thanjavur", state: "Tamil Nadu" },
  { city: "Pattukkottai", district: "Thanjavur", state: "Tamil Nadu" },
  { city: "Pudukkottai", district: "Pudukkottai", state: "Tamil Nadu" },
  { city: "Aranthangi", district: "Pudukkottai", state: "Tamil Nadu" },
  { city: "Sivaganga", district: "Sivaganga", state: "Tamil Nadu" },
  { city: "Karaikudi", district: "Sivaganga", state: "Tamil Nadu" },
  { city: "Ramanathapuram", district: "Ramanathapuram", state: "Tamil Nadu" },
  { city: "Rameswaram", district: "Ramanathapuram", state: "Tamil Nadu" },
  { city: "Paramakudi", district: "Ramanathapuram", state: "Tamil Nadu" },
  { city: "Virudhunagar", district: "Virudhunagar", state: "Tamil Nadu" },
  { city: "Sivakasi", district: "Virudhunagar", state: "Tamil Nadu" },
  { city: "Rajapalayam", district: "Virudhunagar", state: "Tamil Nadu" },
  { city: "Aruppukkottai", district: "Virudhunagar", state: "Tamil Nadu" },
  { city: "Theni", district: "Theni", state: "Tamil Nadu" },
  { city: "Periyakulam", district: "Theni", state: "Tamil Nadu" },
  { city: "Bodinayakanur", district: "Theni", state: "Tamil Nadu" },
  { city: "Cumbum", district: "Theni", state: "Tamil Nadu" },
  { city: "Thoothukudi", district: "Thoothukudi", state: "Tamil Nadu", aliases: ["Tuticorin"] },
  { city: "Kovilpatti", district: "Thoothukudi", state: "Tamil Nadu" },
  { city: "Tiruchendur", district: "Thoothukudi", state: "Tamil Nadu" },
  { city: "Tirunelveli", district: "Tirunelveli", state: "Tamil Nadu", aliases: ["Nellai"] },
  { city: "Palayamkottai", district: "Tirunelveli", state: "Tamil Nadu" },
  { city: "Ambasamudram", district: "Tirunelveli", state: "Tamil Nadu" },
  { city: "Tenkasi", district: "Tenkasi", state: "Tamil Nadu" },
  { city: "Sankarankovil", district: "Tenkasi", state: "Tamil Nadu" },
  { city: "Nagercoil", district: "Kanniyakumari", state: "Tamil Nadu" },
  { city: "Kanyakumari", district: "Kanniyakumari", state: "Tamil Nadu" },
  { city: "Marthandam", district: "Kanniyakumari", state: "Tamil Nadu" },
  { city: "Udhagamandalam", district: "Nilgiris", state: "Tamil Nadu", aliases: ["Ooty"] },
  { city: "Coonoor", district: "Nilgiris", state: "Tamil Nadu" },
  { city: "Kotagiri", district: "Nilgiris", state: "Tamil Nadu" },
  { city: "Gudalur", district: "Nilgiris", state: "Tamil Nadu" },

  // ─── NEIGHBORING STATES (KARNATAKA, KERALA, AP, PUDUCHERRY) ───────
  { city: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka", aliases: ["Bangalore"] },
  { city: "Electronic City", district: "Bengaluru Urban", state: "Karnataka" },
  { city: "Whitefield", district: "Bengaluru Urban", state: "Karnataka" },
  { city: "Mysuru", district: "Mysuru", state: "Karnataka", aliases: ["Mysore"] },
  { city: "Kolar", district: "Kolar", state: "Karnataka" },
  { city: "KGF", district: "Kolar", state: "Karnataka", aliases: ["Kolar Gold Fields"] },
  { city: "Hosakote", district: "Bengaluru Rural", state: "Karnataka" },
  { city: "Mangaluru", district: "Mangaluru (Dakshina Kannada)", state: "Karnataka", aliases: ["Mangalore"] },
  { city: "Hubballi", district: "Hubballi", state: "Karnataka", aliases: ["Hubli"] },
  { city: "Belagavi", district: "Belagavi", state: "Karnataka", aliases: ["Belgaum"] },
  { city: "Tumakuru", district: "Tumakuru", state: "Karnataka", aliases: ["Tumkur"] },

  { city: "Palakkad", district: "Palakkad", state: "Kerala", aliases: ["Palghat"] },
  { city: "Kochi", district: "Ernakulam (Kochi)", state: "Kerala", aliases: ["Cochin", "Ernakulam"] },
  { city: "Kozhikode", district: "Kozhikode", state: "Kerala", aliases: ["Calicut"] },
  { city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala", aliases: ["Trivandrum"] },
  { city: "Thrissur", district: "Thrissur", state: "Kerala", aliases: ["Trichur"] },
  { city: "Kannur", district: "Kannur", state: "Kerala", aliases: ["Cannanore"] },
  { city: "Kollam", district: "Kollam", state: "Kerala", aliases: ["Quilon"] },
  { city: "Alappuzha", district: "Alappuzha", state: "Kerala", aliases: ["Alleppey"] },
  { city: "Kottayam", district: "Kottayam", state: "Kerala" },

  { city: "Chittoor", district: "Chittoor", state: "Andhra Pradesh" },
  { city: "Tirupati", district: "Tirupati", state: "Andhra Pradesh" },
  { city: "Kalahasti", district: "Tirupati", state: "Andhra Pradesh" },
  { city: "Nellore", district: "Nellore", state: "Andhra Pradesh" },
  { city: "Vijayawada", district: "Krishna", state: "Andhra Pradesh" },
  { city: "Guntur", district: "Guntur", state: "Andhra Pradesh" },
  { city: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", aliases: ["Vizag"] },
  { city: "Anantapur", district: "Anantapur", state: "Andhra Pradesh" },
  { city: "Kurnool", district: "Kurnool", state: "Andhra Pradesh" },
  { city: "Kadapa", district: "YSR Kadapa", state: "Andhra Pradesh" },

  { city: "Hyderabad", district: "Hyderabad", state: "Telangana" },
  { city: "Secunderabad", district: "Hyderabad", state: "Telangana" },
  { city: "Warangal", district: "Warangal", state: "Telangana" },

  { city: "Puducherry", district: "Puducherry", state: "Puducherry", aliases: ["Pondicherry", "Pondy"] },
  { city: "Karaikal", district: "Karaikal", state: "Puducherry" },

  { city: "Mumbai", district: "Mumbai", state: "Maharashtra", aliases: ["Bombay"] },
  { city: "Pune", district: "Pune", state: "Maharashtra" },
  { city: "New Delhi", district: "Delhi", state: "Delhi", aliases: ["Delhi"] },
  { city: "Ahmedabad", district: "Ahmedabad", state: "Gujarat" },
  { city: "Kolkata", district: "Kolkata", state: "West Bengal", aliases: ["Calcutta"] }
];

/**
 * Fast search helper for cities, taluks, and districts
 * @param {string} query - search text
 * @param {string|null} selectedState - optional state filter
 * @param {string|null} selectedDistrict - optional district filter
 * @param {number} limit - maximum results to return
 * @returns {Array<{city: string, district: string, state: string, matchType: string}>}
 */
export function searchLocations(query = "", selectedState = null, selectedDistrict = null, limit = 20) {
  const cleanQ = (query || "").trim().toLowerCase();
  if (!cleanQ) {
    // If empty query, return top items in selected district/state if provided
    let fallback = CITIES_AND_TOWNS;
    if (selectedState) {
      fallback = fallback.filter(item => item.state.toLowerCase() === selectedState.toLowerCase());
    }
    if (selectedDistrict) {
      fallback = fallback.filter(item => item.district.toLowerCase() === selectedDistrict.toLowerCase());
    }
    return fallback.slice(0, limit);
  }

  const results = [];
  const seen = new Set();

  // 1. Direct city match (prefix match has top priority)
  for (const item of CITIES_AND_TOWNS) {
    if (selectedState && item.state.toLowerCase() !== selectedState.toLowerCase()) continue;
    if (selectedDistrict && item.district.toLowerCase() !== selectedDistrict.toLowerCase()) continue;

    const cityLower = item.city.toLowerCase();
    const districtLower = item.district.toLowerCase();
    const stateLower = item.state.toLowerCase();
    const aliases = (item.aliases || []).map(a => a.toLowerCase());

    const isCityPrefix = cityLower.startsWith(cleanQ);
    const isAliasPrefix = aliases.some(a => a.startsWith(cleanQ));
    const isDistrictPrefix = districtLower.startsWith(cleanQ);
    const isCityContains = cityLower.includes(cleanQ);
    const isDistrictContains = districtLower.includes(cleanQ);

    if (isCityPrefix || isAliasPrefix || isDistrictPrefix || isCityContains || isDistrictContains) {
      const key = `${item.city}|${item.district}|${item.state}`;
      if (!seen.has(key)) {
        seen.add(key);
        let score = 0;
        if (isCityPrefix) score = 100;
        else if (isAliasPrefix) score = 90;
        else if (isDistrictPrefix) score = 80;
        else if (isCityContains) score = 60;
        else score = 40;

        results.push({ ...item, score });
      }
    }
  }

  // Also match district names directly if user typed a district name (e.g. "Namakkal" or "Salem")
  if (!selectedDistrict) {
    const statesToSearch = selectedState ? [selectedState] : Object.keys(DISTRICTS_BY_STATE);
    for (const state of statesToSearch) {
      const districts = DISTRICTS_BY_STATE[state] || [];
      for (const d of districts) {
        if (d.toLowerCase().includes(cleanQ)) {
          const key = `${d}|${d}|${state}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              city: d,
              district: d,
              state: state,
              score: d.toLowerCase().startsWith(cleanQ) ? 85 : 55
            });
          }
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
