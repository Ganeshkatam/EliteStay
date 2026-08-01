import { faker } from '@faker-js/faker';
import fs from 'fs';

const uuids = Array.from({ length: 100 }, () => faker.string.uuid());
let uuidIndex = 0;
const getUuid = () => uuids[uuidIndex++];

const adminId = getUuid();
const hostIds = [getUuid(), getUuid(), getUuid()];
const guestIds = Array.from({ length: 8 }, () => getUuid());

let sql = `-- EliteStay V2 Seed Data

TRUNCATE public.messages, public.conversations, public.notifications, public.reviews, public.stay_events, public.stays, public.booking_events, public.bookings, public.listing_prices, public.listing_images, public.listing_build_progress, public.listing_amenities, public.listings, public.amenities, public.accommodation_types, public.user_preferences, public.profiles CASCADE;

DELETE FROM auth.users WHERE email LIKE '%@elitestay.com';
DELETE FROM auth.identities WHERE provider_id LIKE '%@elitestay.com';

-- 2. Auth Users & Profiles
`;

const generateUser = (
  id: string,
  role: string,
  emailPrefix: string,
  name: string
) => {
  const email = `${emailPrefix}@elitestay.com`;
  return `
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('${id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${email}', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"${name}","role":"${role}"}', now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), '${id}', format('{"sub":"%s","email":"%s"}', '${id}', '${email}')::jsonb, 'email', '${email}', now(), now(), now());
`;
};

sql += generateUser(adminId, 'admin', 'admin', 'Admin User');
hostIds.forEach((id, i) => {
  sql += generateUser(id, 'host', `host${i + 1}`, faker.person.fullName());
});
guestIds.forEach((id, i) => {
  sql += generateUser(id, 'guest', `guest${i + 1}`, faker.person.fullName());
});

sql += `
-- 3. Override roles in profiles (since trigger defaults to guest)
UPDATE public.profiles SET role = 'admin' WHERE id = '${adminId}';
`;
hostIds.forEach((id) => {
  sql += `UPDATE public.profiles SET role = 'host' WHERE id = '${id}';\n`;
});

sql += `
-- 4. Accommodation Types and Amenities
INSERT INTO public.accommodation_types (id, name, description) VALUES 
(gen_random_uuid(), 'PG', 'Paying Guest Accommodation'),
(gen_random_uuid(), 'Apartment', 'Full Apartment'),
(gen_random_uuid(), 'Hostel', 'Shared Hostel'),
(gen_random_uuid(), 'Coliving', 'Co-living space'),
(gen_random_uuid(), 'Student Housing', 'Housing for students');

INSERT INTO public.amenities (id, name, icon) VALUES 
(gen_random_uuid(), 'WiFi', 'wifi'),
(gen_random_uuid(), 'Air Conditioning', 'snowflake'),
(gen_random_uuid(), 'Kitchen', 'kitchen'),
(gen_random_uuid(), 'Parking', 'parking'),
(gen_random_uuid(), 'Pool', 'pool'),
(gen_random_uuid(), 'Gym', 'dumbbell');
`;

sql += `
-- 5. Listings
`;

const listingIds: string[] = [];

const indianCities = [
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
];

for (let i = 0; i < 30; i++) {
  const listingId = getUuid();
  listingIds.push(listingId);
  const hostId = faker.helpers.arrayElement(hostIds);
  const title = faker.lorem.words(3).replace(/'/g, "''");
  const desc = faker.lorem.paragraph().replace(/'/g, "''");
  const publicId = faker.string.alphanumeric(8).toUpperCase();
  const price = faker.number.int({ min: 5000, max: 30000 });
  const deposit = faker.number.int({ min: 1000, max: 10000 });

  // Pick random city and add minor offset so listings spread out on map
  const targetCity = faker.helpers.arrayElement(indianCities);
  const latOffset = (Math.random() - 0.5) * 0.08;
  const lngOffset = (Math.random() - 0.5) * 0.08;
  const finalLat = targetCity.lat + latOffset;
  const finalLng = targetCity.lng + lngOffset;

  sql += `
INSERT INTO public.listings (id, public_id, host_id, title, description, accommodation_type_id, formatted_address, locality, city, state, country, postal_code, status, latitude, longitude)
VALUES ('${listingId}', '${publicId}', '${hostId}', '${title}', '${desc}', (SELECT id FROM public.accommodation_types ORDER BY random() LIMIT 1), '${faker.location.streetAddress().replace(/'/g, "''")}', '${faker.location.street().replace(/'/g, "''")}', '${targetCity.name}', '${targetCity.state}', 'India', '${faker.location.zipCode()}', 'published', ${finalLat}, ${finalLng});
 
INSERT INTO public.listing_prices (listing_id, amount, currency, billing_period, security_deposit)
VALUES ('${listingId}', ${price}, 'INR', 'month', ${deposit});
`;
}

sql += `
-- 6. Bookings and Stays
`;

const b1 = getUuid();
sql += `
INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('${b1}', '${listingIds[0]}', '${guestIds[0]}', '${faker.date.soon().toISOString().split('T')[0]}', 3, 'pending', 10000, 5000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, new_status) VALUES ('${b1}', 'request_created', '${guestIds[0]}', 'pending');
`;

const b2 = getUuid();
sql += `
INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('${b2}', '${listingIds[1]}', '${guestIds[1]}', '${faker.date.soon().toISOString().split('T')[0]}', 3, 'approved', 12000, 6000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, new_status) VALUES ('${b2}', 'request_created', '${guestIds[1]}', 'pending');
INSERT INTO public.booking_events (booking_id, action, actor_id, previous_status, new_status) VALUES ('${b2}', 'approved', '${hostIds[0]}', 'pending', 'approved');
`;

const b3 = getUuid();
sql += `
INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('${b3}', '${listingIds[2]}', '${guestIds[2]}', '${faker.date.recent().toISOString().split('T')[0]}', 3, 'rejected', 8000, 4000, 0, 'month', 1);
INSERT INTO public.booking_events (booking_id, action, actor_id, previous_status, new_status) VALUES ('${b3}', 'rejected', '${hostIds[0]}', 'pending', 'rejected');
`;

const b4 = getUuid();
const s4 = getUuid();
sql += `
INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('${b4}', '${listingIds[3]}', '${guestIds[3]}', '${faker.date.recent().toISOString().split('T')[0]}', 3, 'approved', 15000, 7000, 0, 'month', 1);
INSERT INTO public.stays (id, created_from_booking_id, listing_id, guest_id, status, expected_move_in_date, actual_move_in_date, expected_move_out_date, agreed_amount, agreed_billing_period, security_deposit_paid)
VALUES ('${s4}', '${b4}', '${listingIds[3]}', '${guestIds[3]}', 'active', '${faker.date.recent().toISOString().split('T')[0]}', '${faker.date.recent().toISOString().split('T')[0]}', '2026-10-31', 15000, 'month', 7000);
INSERT INTO public.stay_events (stay_id, action, actor_id, new_status) VALUES ('${s4}', 'active', '${hostIds[1]}', 'active');
`;

const b5 = getUuid();
const s5 = getUuid();
sql += `
INSERT INTO public.bookings (id, listing_id, guest_id, requested_move_in, requested_duration, status, snapshot_monthly_rent, snapshot_security_deposit, snapshot_maintenance_fee, snapshot_billing_period, snapshot_minimum_stay)
VALUES ('${b5}', '${listingIds[4]}', '${guestIds[4]}', '${faker.date.past().toISOString().split('T')[0]}', 3, 'approved', 11000, 5000, 0, 'month', 1);
INSERT INTO public.stays (id, created_from_booking_id, listing_id, guest_id, status, expected_move_in_date, actual_move_in_date, expected_move_out_date, actual_move_out_date, agreed_amount, agreed_billing_period, security_deposit_paid)
VALUES ('${s5}', '${b5}', '${listingIds[4]}', '${guestIds[4]}', 'completed', '${faker.date.past().toISOString().split('T')[0]}', '${faker.date.past().toISOString().split('T')[0]}', '${faker.date.recent().toISOString().split('T')[0]}', '${faker.date.recent().toISOString().split('T')[0]}', 11000, 'month', 5000);
INSERT INTO public.stay_events (stay_id, action, actor_id, new_status) VALUES ('${s5}', 'completed', '${hostIds[2]}', 'completed');
INSERT INTO public.reviews (stay_id, listing_id, guest_id, rating, comment)
VALUES ('${s5}', '${listingIds[4]}', '${guestIds[4]}', 5, 'Amazing stay! Highly recommended.');
`;

sql += `
-- 7. Messaging and Notifications
`;

const c1 = getUuid();
sql += `
INSERT INTO public.conversations (id, booking_id)
VALUES ('${c1}', '${b1}');

INSERT INTO public.messages (conversation_id, sender_id, content) VALUES
('${c1}', '${guestIds[0]}', 'Hi, I would like to book this place.'),
('${c1}', '${hostIds[0]}', 'Great! I will approve it shortly.');

INSERT INTO public.notifications (user_id, type, title, message) VALUES
('${guestIds[0]}', 'SYSTEM', 'Welcome to EliteStay', 'Complete your profile to get started.'),
('${hostIds[0]}', 'BOOKING_REQUEST', 'New Request', 'You have a new booking request.');
`;

fs.writeFileSync('supabase/migrations/99999999999999_seed.sql', sql);
console.log(
  'Seed SQL generated at supabase/migrations/99999999999999_seed.sql'
);
