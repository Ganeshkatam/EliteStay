WITH updates AS (
  SELECT id,
         (row_number() over (order by id) - 1) as r
  FROM public.listings
),
mapping AS (
  SELECT 0 as r, 'Modern 2BHK Apartment in Bandra' as title, 'Experience the vibrant life of Mumbai in this beautifully furnished 2BHK apartment. Just a walk away from Carter Road and top cafes.' as desc UNION ALL
  SELECT 1 as r, 'Luxury Suite near Connaught Place' as title, 'Located in the heart of the capital, this luxury suite offers unparalleled access to Delhi''s best dining and shopping destinations.' as desc UNION ALL
  SELECT 2 as r, 'Spacious Villa in Banjara Hills' as title, 'A grand villa in the upscale neighborhood of Banjara Hills. Perfect for families looking for a luxurious stay with premium amenities.' as desc UNION ALL
  SELECT 3 as r, 'Cozy Studio in Koregaon Park' as title, 'A peaceful and cozy studio surrounded by the lush greenery of Koregaon Park. Ideal for solo travelers and couples.' as desc UNION ALL
  SELECT 4 as r, 'Premium 3BHK in Koramangala' as title, 'Spacious 3-bedroom apartment in Koramangala with modern decor, high-speed WiFi, and close proximity to the best startup hubs and pubs.' as desc UNION ALL
  SELECT 5 as r, 'Sea-view Penthouse in Bandra West' as title, 'Wake up to the sound of waves in this premium sea-view penthouse. Features a private terrace and exquisite modern interiors.' as desc UNION ALL
  SELECT 6 as r, 'Heritage Stay in Central Delhi' as title, 'Step back in time with this beautifully restored heritage home, located just minutes away from the bustling Connaught Place.' as desc UNION ALL
  SELECT 7 as r, 'Elegant Home with Garden in Banjara Hills' as title, 'An elegant home featuring a private garden space, located in the peaceful and prestigious Banjara Hills area.' as desc UNION ALL
  SELECT 8 as r, 'Chic Loft near Osho Ashram Pune' as title, 'A trendy, industrial-style loft located right next to the famous Osho Ashram. Experience tranquility with a modern touch.' as desc UNION ALL
  SELECT 9 as r, 'Boutique Apartment in heart of Koramangala' as title, 'A boutique apartment offering a blend of comfort and style. Located right in the heart of Bangalore''s favorite neighborhood.' as desc UNION ALL
  SELECT 10 as r, 'Minimalist 1BHK in Bandra' as title, 'Clean, minimalist, and perfectly located. This 1BHK offers everything you need for a comfortable stay in Mumbai.' as desc UNION ALL
  SELECT 11 as r, 'Business Suite near CP Metro' as title, 'Designed for the modern business traveler, this suite offers a dedicated workspace and is just steps away from the metro station.' as desc UNION ALL
  SELECT 12 as r, 'Royal Villa Stay in Hyderabad' as title, 'Live like royalty in this expansive villa. Features traditional architecture blended with modern comforts and a private pool.' as desc UNION ALL
  SELECT 13 as r, 'Serene Getaway in Koregaon Park' as title, 'Escape the city noise in this serene Koregaon Park retreat. Enjoy your morning coffee on the spacious balcony overlooking old banyan trees.' as desc UNION ALL
  SELECT 14 as r, 'Tech-Hub Studio Koramangala' as title, 'Perfect for digital nomads! This studio offers gigabit internet, an ergonomic workspace, and is close to all major tech parks.' as desc UNION ALL
  SELECT 15 as r, 'Artistic Haven in Bandra' as title, 'An artistic space curated with local art and vintage furniture. A true reflection of Bandra''s creative soul.' as desc UNION ALL
  SELECT 16 as r, 'Classic Delhi Home near Connaught Place' as title, 'A classic Delhi home with high ceilings and spacious rooms. Experience authentic North Indian hospitality in a prime location.' as desc UNION ALL
  SELECT 17 as r, 'Luxury Service Apt Banjara Hills' as title, 'Fully serviced luxury apartment with daily housekeeping, in-house chef available on request, and round-the-clock security.' as desc UNION ALL
  SELECT 18 as r, 'Green Retreat in Koregaon Park' as title, 'Surround yourself with nature in this beautiful green retreat. Features indoor plants and eco-friendly amenities.' as desc UNION ALL
  SELECT 19 as r, 'Modern Flat with Balcony in Koramangala' as title, 'A bright and airy modern flat featuring a large balcony. Perfect for enjoying Bangalore''s beautiful weather.' as desc
)
UPDATE public.listings l
SET title = m.title,
    description = m.desc
FROM updates u
JOIN mapping m ON u.r = m.r
WHERE l.id = u.id;