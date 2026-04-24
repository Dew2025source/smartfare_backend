const fs = require("fs");

const rawLocations = [
  { name: "Connaught Place", lat: 28.6315, lng: 77.2167 },
  { name: "Saket", lat: 28.5245, lng: 77.2066 },
  { name: "Rohini", lat: 28.7495, lng: 77.0565 },
  { name: "Dwarka", lat: 28.5921, lng: 77.0460 },
  { name: "Lajpat Nagar", lat: 28.5677, lng: 77.2431 },
  { name: "Karol Bagh", lat: 28.6519, lng: 77.1909 },
  { name: "Rajouri Garden", lat: 28.6425, lng: 77.1213 },
  { name: "Nehru Place", lat: 28.5494, lng: 77.2513 },
  { name: "AIIMS", lat: 28.5672, lng: 77.2100 },
  { name: "New Delhi Railway Station", lat: 28.6436, lng: 77.2194 },
  { name: "IGI Airport", lat: 28.5562, lng: 77.1000 },
  { name: "Noida Sector 18", lat: 28.5708, lng: 77.3260 },
  { name: "Noida Sector 62", lat: 28.6289, lng: 77.3649 },
  { name: "Noida City Centre", lat: 28.5743, lng: 77.3561 },
  { name: "Gurgaon", lat: 28.4595, lng: 77.0266 },
  { name: "Cyber Hub Gurgaon", lat: 28.4950, lng: 77.0892 },
  { name: "Cyber City", lat: 28.4947, lng: 77.0890 },
  { name: "Huda City Centre", lat: 28.4595, lng: 77.0721 },
  { name: "Faridabad", lat: 28.4089, lng: 77.3178 },
  { name: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { name: "Ghaziabad Railway Station", lat: 28.6656, lng: 77.4391 },
  { name: "Anand Vihar", lat: 28.6469, lng: 77.3153 },
  { name: "Akshardham", lat: 28.6127, lng: 77.2773 },
  { name: "Chandni Chowk", lat: 28.6506, lng: 77.2303 },
  { name: "Kalkaji", lat: 28.5495, lng: 77.2588 },
  { name: "Green Park", lat: 28.5584, lng: 77.2066 },
  { name: "Chhatarpur", lat: 28.5067, lng: 77.1750 },
  { name: "Sarojini Nagar", lat: 28.5775, lng: 77.1986 },
  { name: "Paschim Vihar", lat: 28.6706, lng: 77.1121 },
  { name: "Moti Nagar", lat: 28.6647, lng: 77.1426 },
  { name: "Kamla Nagar", lat: 28.6800, lng: 77.2050 },
  { name: "Jhandewalan", lat: 28.6440, lng: 77.2010 },
  { name: "Paharganj", lat: 28.6420, lng: 77.2167 },
  { name: "Kirti Nagar", lat: 28.6530, lng: 77.1479 },
  { name: "Bhikaji Cama Place", lat: 28.5678, lng: 77.1883 },
  { name: "Gole Market", lat: 28.6353, lng: 77.2050 },
  { name: "Barakhamba Road", lat: 28.6296, lng: 77.2252 },
  { name: "ITO", lat: 28.6289, lng: 77.2410 },
  { name: "Noida Sector 15", lat: 28.5916, lng: 77.3100 },
  { name: "Gurgaon Sector 29", lat: 28.4683, lng: 77.0705 },
  { name: "Mandawali Fazalpur", lat: 28.6268, lng: 77.3100 },
  { name: "Laxmi Nagar", lat: 28.6319, lng: 77.2787 },
  { name: "Preet Vihar", lat: 28.6415, lng: 77.2950 },
  { name: "Mayur Vihar", lat: 28.6067, lng: 77.2942 },
  { name: "Kashmere Gate", lat: 28.6673, lng: 77.2280 },
  { name: "India Gate", lat: 28.6129, lng: 77.2295 },
  { name: "Defence Colony", lat: 28.5724, lng: 77.2311 },
  { name: "Patel Nagar", lat: 28.6513, lng: 77.1593 },
  { name: "South Extension", lat: 28.5680, lng: 77.2200 },
  { name: "Malviya Nagar", lat: 28.5355, lng: 77.2100 },
  { name: "Greater Kailash", lat: 28.5484, lng: 77.2381 },
  { name: "Shalimar Bagh", lat: 28.7202, lng: 77.1639 },
  { name: "Model Town", lat: 28.7050, lng: 77.1900 },
  { name: "Shahdara", lat: 28.6735, lng: 77.2890 },
  { name: "Vasant Kunj", lat: 28.5273, lng: 77.1558 },
  { name: "Pitampura", lat: 28.6956, lng: 77.1320 },
  { name: "Janakpuri", lat: 28.6219, lng: 77.0878 },
  { name: "Hauz Khas", lat: 28.5494, lng: 77.2001 },
  { name: "Punjabi Bagh", lat: 28.6692, lng: 77.1255 },
  { name: "Vikaspuri", lat: 28.6383, lng: 77.0822 },
  { name: "Uttam Nagar", lat: 28.6217, lng: 77.0562 },
  { name: "Dilshad Garden", lat: 28.6825, lng: 77.3230 },
  { name: "Indirapuram", lat: 28.6469, lng: 77.3700 },

  // Extra Delhi NCR locations
  { name: "Old Delhi Railway Station", lat: 28.6600, lng: 77.2275 },
  { name: "Civil Lines", lat: 28.6766, lng: 77.2250 },
  { name: "Ramesh Nagar", lat: 28.6528, lng: 77.1317 },
  { name: "Subhash Nagar", lat: 28.6401, lng: 77.1047 },
  { name: "Tilak Nagar", lat: 28.6365, lng: 77.0968 },
  { name: "Tagore Garden", lat: 28.6431, lng: 77.1127 },
  { name: "Netaji Subhash Place", lat: 28.6967, lng: 77.1522 },
  { name: "Azadpur", lat: 28.7060, lng: 77.1750 },
  { name: "Mukherjee Nagar", lat: 28.7104, lng: 77.2058 },
  { name: "Burari", lat: 28.7538, lng: 77.1986 },
  { name: "Narela", lat: 28.8527, lng: 77.0929 },
  { name: "Bawana", lat: 28.7996, lng: 77.0343 },
  { name: "Najafgarh", lat: 28.6090, lng: 76.9855 },
  { name: "Palam", lat: 28.5916, lng: 77.0824 },
  { name: "Mahipalpur", lat: 28.5449, lng: 77.1221 },
  { name: "Aerocity", lat: 28.5486, lng: 77.1200 },
  { name: "Munirka", lat: 28.5558, lng: 77.1741 },
  { name: "RK Puram", lat: 28.5677, lng: 77.1766 },
  { name: "Lodhi Road", lat: 28.5918, lng: 77.2279 },
  { name: "Nizamuddin", lat: 28.5880, lng: 77.2527 },
  { name: "Ashram", lat: 28.5720, lng: 77.2587 },
  { name: "Badarpur", lat: 28.4937, lng: 77.3033 },
  { name: "Okhla", lat: 28.5355, lng: 77.2732 },
  { name: "Jasola", lat: 28.5450, lng: 77.2960 },
  { name: "Botanical Garden", lat: 28.5641, lng: 77.3343 },
  { name: "Sector 37 Noida", lat: 28.5635, lng: 77.3370 },
  { name: "Sector 50 Noida", lat: 28.5700, lng: 77.3630 },
  { name: "Sector 137 Noida", lat: 28.5120, lng: 77.4080 },
  { name: "Pari Chowk", lat: 28.4674, lng: 77.5030 },
  { name: "Knowledge Park", lat: 28.4744, lng: 77.4880 },
  { name: "Vaishali", lat: 28.6490, lng: 77.3390 },
  { name: "Kaushambi", lat: 28.6460, lng: 77.3395 },
  { name: "Vasundhara", lat: 28.6639, lng: 77.3730 },
  { name: "Crossings Republik", lat: 28.6250, lng: 77.4340 },
  { name: "Sahibabad", lat: 28.6735, lng: 77.4324 },
  { name: "Mohan Nagar", lat: 28.6777, lng: 77.3749 },
  { name: "Raj Nagar Extension", lat: 28.7016, lng: 77.4108 },
  { name: "Golf Course Road", lat: 28.4375, lng: 77.1015 },
  { name: "Sohna Road", lat: 28.4089, lng: 77.0464 },
  { name: "Udyog Vihar", lat: 28.5007, lng: 77.0847 },
  { name: "DLF Phase 1", lat: 28.4769, lng: 77.0942 },
  { name: "DLF Phase 2", lat: 28.4978, lng: 77.0867 },
  { name: "DLF Phase 3", lat: 28.5035, lng: 77.1011 },
  { name: "DLF Phase 4", lat: 28.4672, lng: 77.0824 },
  { name: "MG Road Gurgaon", lat: 28.4792, lng: 77.0808 },
  { name: "Sikanderpur", lat: 28.4818, lng: 77.0930 },
  { name: "IFFCO Chowk", lat: 28.4729, lng: 77.0711 },
  { name: "Sector 56 Gurgaon", lat: 28.4252, lng: 77.1045 },
  { name: "Ballabhgarh", lat: 28.3404, lng: 77.3206 },
  { name: "NIT Faridabad", lat: 28.3974, lng: 77.3126 },
  { name: "Surajkund", lat: 28.4902, lng: 77.2890 }
];

function buildLocationCoords(data) {
  const result = {};

  for (const item of data) {
    if (!item.name || typeof item.lat !== "number" || typeof item.lng !== "number") {
      continue;
    }
    result[item.name] = {
      lat: Number(item.lat.toFixed(4)),
      lng: Number(item.lng.toFixed(4)),
    };
  }

  return result;
}

const locationCoords = buildLocationCoords(rawLocations);

const output = `module.exports = ${JSON.stringify(locationCoords, null, 2)};\n`;

fs.writeFileSync("generated-locationCoords.js", output, "utf8");

console.log(`Generated ${Object.keys(locationCoords).length} locations in generated-locationCoords.js`);