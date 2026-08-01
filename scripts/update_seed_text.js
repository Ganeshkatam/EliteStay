const fs = require('fs');

const indianTitles = [
  "Modern 2BHK Apartment in Bandra",
  "Luxury Suite near Connaught Place",
  "Spacious Villa in Banjara Hills",
  "Cozy Studio in Koregaon Park",
  "Premium 3BHK in Koramangala",
  "Sea-view Penthouse in Bandra West",
  "Heritage Stay in Central Delhi",
  "Elegant Home with Garden in Banjara Hills",
  "Chic Loft near Osho Ashram Pune",
  "Boutique Apartment in heart of Koramangala",
  "Minimalist 1BHK in Bandra",
  "Business Suite near CP Metro",
  "Royal Villa Stay in Hyderabad",
  "Serene Getaway in Koregaon Park",
  "Tech-Hub Studio Koramangala",
  "Artistic Haven in Bandra",
  "Classic Delhi Home near Connaught Place",
  "Luxury Service Apt Banjara Hills",
  "Green Retreat in Koregaon Park",
  "Modern Flat with Balcony in Koramangala"
];

const indianDesc = [
  "Experience the vibrant life of Mumbai in this beautifully furnished 2BHK apartment. Just a walk away from Carter Road and top cafes.",
  "Located in the heart of the capital, this luxury suite offers unparalleled access to Delhi's best dining and shopping destinations.",
  "A grand villa in the upscale neighborhood of Banjara Hills. Perfect for families looking for a luxurious stay with premium amenities.",
  "A peaceful and cozy studio surrounded by the lush greenery of Koregaon Park. Ideal for solo travelers and couples.",
  "Spacious 3-bedroom apartment in Koramangala with modern decor, high-speed WiFi, and close proximity to the best startup hubs and pubs.",
  "Wake up to the sound of waves in this premium sea-view penthouse. Features a private terrace and exquisite modern interiors.",
  "Step back in time with this beautifully restored heritage home, located just minutes away from the bustling Connaught Place.",
  "An elegant home featuring a private garden space, located in the peaceful and prestigious Banjara Hills area.",
  "A trendy, industrial-style loft located right next to the famous Osho Ashram. Experience tranquility with a modern touch.",
  "A boutique apartment offering a blend of comfort and style. Located right in the heart of Bangalore's favorite neighborhood.",
  "Clean, minimalist, and perfectly located. This 1BHK offers everything you need for a comfortable stay in Mumbai.",
  "Designed for the modern business traveler, this suite offers a dedicated workspace and is just steps away from the metro station.",
  "Live like royalty in this expansive villa. Features traditional architecture blended with modern comforts and a private pool.",
  "Escape the city noise in this serene Koregaon Park retreat. Enjoy your morning coffee on the spacious balcony overlooking old banyan trees.",
  "Perfect for digital nomads! This studio offers gigabit internet, an ergonomic workspace, and is close to all major tech parks.",
  "An artistic space curated with local art and vintage furniture. A true reflection of Bandra's creative soul.",
  "A classic Delhi home with high ceilings and spacious rooms. Experience authentic North Indian hospitality in a prime location.",
  "Fully serviced luxury apartment with daily housekeeping, in-house chef available on request, and round-the-clock security.",
  "Surround yourself with nature in this beautiful green retreat. Features indoor plants and eco-friendly amenities.",
  "A bright and airy modern flat featuring a large balcony. Perfect for enjoying Bangalore's beautiful weather."
];

let sql = fs.readFileSync('supabase/migrations/99999999999999_seed.sql', 'utf8');

const regex = /(INSERT INTO public\.listings\s*\([^)]*\)\s*VALUES\s*\('[^']+',\s*'[^']+',\s*'[^']+',\s*)'([^']+)'(,\s*)'([^']+)'/g;

let matchCount = 0;
sql = sql.replace(regex, (match, prefix, oldTitle, comma, oldDesc) => {
  const newTitle = indianTitles[matchCount];
  const newDesc = indianDesc[matchCount];
  matchCount++;
  // We need to double single quotes to escape them in SQL
  return `${prefix}'${newTitle.replace(/'/g, "''")}'${comma}'${newDesc.replace(/'/g, "''")}'`;
});

fs.writeFileSync('supabase/migrations/99999999999999_seed.sql', sql);
console.log('Seed updated with English titles/descriptions! Replacements:', matchCount);
