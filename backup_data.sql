--
-- PostgreSQL database dump
--

\restrict mMOlsDqrPhWGYYLKG29j1PNKzW0uzdDmgABC4UySFCj3ZmPqzsl58Hjuyt80zNl

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: bracketformats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.bracketformats (id, name, description, "createdAt", "updatedAt") VALUES (1, 'single Elimination', 'Single elimination with gold and silver medals', '2026-07-10 22:26:34.952', '2026-07-10 22:26:34.952');
INSERT INTO public.bracketformats (id, name, description, "createdAt", "updatedAt") VALUES (2, 'Double Elimination', 'The winner of the consolation for the gold medal.', '2026-07-10 22:26:34.954', '2026-07-10 22:26:34.954');
INSERT INTO public.bracketformats (id, name, description, "createdAt", "updatedAt") VALUES (3, 'Round Robin', 'All teams play against each other one time.', '2026-07-10 22:26:34.954', '2026-07-10 22:26:34.954');
INSERT INTO public.bracketformats (id, name, description, "createdAt", "updatedAt") VALUES (4, 'Double Round Robin', 'All teams play against each other two times.', '2026-07-10 22:26:34.954', '2026-07-10 22:26:34.954');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, name, "createdAt", "updatedAt") VALUES (1, 'admin', '2026-07-10 18:21:40.441671', '2026-07-10 18:21:40.441671');
INSERT INTO public.roles (id, name, "createdAt", "updatedAt") VALUES (3, 'host', '2026-07-10 22:26:34.922', '2026-07-10 22:26:34.922');
INSERT INTO public.roles (id, name, "createdAt", "updatedAt") VALUES (4, 'player', '2026-07-10 22:26:34.936', '2026-07-10 22:26:34.936');
INSERT INTO public.roles (id, name, "createdAt", "updatedAt") VALUES (5, 'organizer', '2026-07-10 22:26:34.937', '2026-07-10 22:26:34.937');
INSERT INTO public.roles (id, name, "createdAt", "updatedAt") VALUES (6, 'super_admin', '2026-07-10 22:26:34.938', '2026-07-10 22:26:34.938');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (1, 'Super', 'Admin', 'admin@jomg.com', '$2b$10$nuw00QsxoEfn2W.CjalKgeSyjPcYkIuVN/lUS1Rcy8X3Oyi2AMX06', 'local', NULL, NULL, 30, 'male', '+10000000001', true, NULL, NULL, NULL, NULL, NULL, 0, '2026-07-10 22:26:35.017', '2026-07-10 22:26:35.017', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (2, 'Default', 'Organizer', 'organizer@jomg.com', '$2b$10$YCHS8wHMkh8HCdhVBtbX6eGyE.VpKW5YIn5zb0ce7OGaiTjG.zvfe', 'local', NULL, NULL, 28, 'male', '+10000000002', true, NULL, NULL, NULL, NULL, NULL, 0, '2026-07-10 22:26:35.067', '2026-07-10 22:26:35.067', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (10, 'Maria', 'Chen', 'maria.chen@example.com', '$2b$10$M5Rs6md9CmdrwB1XAz4dpuKvn8LJLVRQ4o/CIIlDQ7tiK0es97ETu', 'local', NULL, NULL, 31, 'female', '(512) 555-0101', false, 'afa3fbace691b96cca4f83a0f41aa1442826b696e714f9cb765adcb78fbce9f9', NULL, NULL, '2026-07-12 16:46:17.769', 4.15, 0, '2026-07-11 16:46:17.769', '2026-07-11 16:46:17.773', 'DUPR-12346', '@mariachen', 'facebook.com/mariachen', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (11, 'Derek', 'Wilson', 'derek.wilson@example.com', '$2b$10$9D/nzJfXi7l31hKR65UiAuO73xEHgBY03azfX0Mf2kghcVPRTb0WC', 'local', NULL, NULL, 29, 'male', '(512) 555-0102', false, '4a7b42cb05e5588e77a44d392a8f1f075eddc9f41b71ce5ec5ccb0b18f259577', NULL, NULL, '2026-07-12 16:46:17.832', 3.60, 0, '2026-07-11 16:46:17.832', '2026-07-11 16:46:17.835', 'DUPR-12347', '@derekwilson', 'facebook.com/derekwilson', 'PayPal', 'unpaid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (12, 'Priya', 'Nair', 'priya.nair@example.com', '$2b$10$2U2ki06hriYI3qXDqO3Gmu3bFomnZCcU7WhAFGBtr9JzDGrYgYkxO', 'local', NULL, NULL, 27, 'female', '(512) 555-0103', false, '7927b1b39daa5baf6482df937db8a8b8d2a5b7c23e53f1497c279fdd595b44e7', NULL, NULL, '2026-07-12 16:46:17.892', 3.55, 0, '2026-07-11 16:46:17.892', '2026-07-11 16:46:17.894', 'DUPR-12348', '@priyanair', 'facebook.com/priyanair', 'PayPal', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (3, 'Alex', 'Turner', 'alex@example.com', '$2b$10$6vl6MMciNy3v.HbyLVREZuwzzriKMnV82wX0/JEzXKwAvPL9Xsgn.', 'local', NULL, NULL, 34, 'male', '(512) 555-0101', false, '8f1f2ddd78f66154bfe2bea3febc63ffec07d8c8bb8946d3db6ff2b7cd9b965c', NULL, NULL, '2026-07-11 22:38:12.275', 4.20, 0, '2026-07-10 22:38:12.277', '2026-07-10 22:38:14.44', 'DUPR-12345', '@alexturner', 'facebook.com/alexturner', 'Stripe', 'unpaid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (4, 'Jordan', 'Smith', 'jordan@example.com', '$2b$10$qaUgRIFSVR/g1qEb7uqq9eNSl0f9sJYxNFQj7vul31OfceCODgFPu', 'local', NULL, NULL, 28, 'female', '(512) 555-0102', false, '2b72a07dc0f82c4a15d22abd97c0e40586f469aae412d61484eacaa0c4e924d4', NULL, NULL, '2026-07-11 22:38:12.349', 3.75, 0, '2026-07-10 22:38:12.349', '2026-07-10 22:38:14.446', 'DUPR-12346', '@jordansmith', 'facebook.com/jordansmith', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (5, 'Marcus', 'Lee', 'marcus@example.com', '$2b$10$E/wCV4H1fRE1.eKEqNozLuljpaS.oU8v.f3zErmrKMsdrdgunBUiq', 'local', NULL, NULL, 31, 'male', '(512) 555-0103', false, '8263676117041fb598adc405a8291f8d20f95a9246df7c4d5b91b000bc7c4f73', NULL, NULL, '2026-07-11 22:38:12.408', 4.05, 0, '2026-07-10 22:38:12.408', '2026-07-10 22:38:14.454', 'DUPR-12347', '@marcuslee', 'facebook.com/marcuslee', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (6, 'Priya', 'Patel', 'priya@example.com', '$2b$10$/41accb6y65d5YWiBGUKEOIJJTPqOyxrXFIQFQpZwdF7xdBq9z59C', 'local', NULL, NULL, 29, 'female', '(512) 555-0104', false, '12033930c0bb46f61e8d85544e86753f67b21a0c4a712bc8df1e2a628c65e5c3', NULL, NULL, '2026-07-11 22:38:12.467', 3.90, 0, '2026-07-10 22:38:12.467', '2026-07-10 22:38:14.463', 'DUPR-12348', '@priyapatel', 'facebook.com/priyapatel', 'Stripe', 'unpaid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (7, 'Chris', 'Nguyen', 'chris@example.com', '$2b$10$cd0ji6fMdWHFKNkZ.8lI5OCRdgoIx7StGI7A5Pj3SVGoyCrUS/22C', 'local', NULL, NULL, 36, 'male', '(512) 555-0105', false, '8961623ee9261d88e463388acedfd354fd1e89efd9cf728ad54fcc6387afb60c', NULL, NULL, '2026-07-11 22:38:12.529', 3.80, 0, '2026-07-10 22:38:12.529', '2026-07-10 22:38:14.469', 'DUPR-12349', '@chrisnguyen', 'facebook.com/chrisnguyen', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (8, 'Sam', 'Lee', 'samlee@example.com', '$2b$10$aHcoXsdU8b3w9JY3luB80O1N9.gBeVo4QRqGRGEb.gvL9bUflNapO', 'local', NULL, NULL, 27, 'female', '(512) 555-0106', false, 'ee91e5a0d80e4aa3a38fe05512f32c6547e4fbe92d3ecc99365f14e4816a2f83', NULL, NULL, '2026-07-11 22:38:12.587', 3.65, 0, '2026-07-10 22:38:12.587', '2026-07-10 22:38:14.473', 'DUPR-12350', '@samlee', 'facebook.com/samlee', 'Stripe', 'unpaid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (9, 'Alex', 'Turner', 'alex.turner@example.com', '$2b$10$QuyIh4MjkgfkA9zybIgh9OWrNvOQ7u9iDDgGKdmEjzpzOWvq3e7Hm', 'local', NULL, NULL, 34, 'male', '(512) 555-0100', false, '227c05e247bb979a06c5a091a35035d28b2557412592de75458bd1753ada825b', NULL, NULL, '2026-07-12 16:46:17.685', 4.20, 0, '2026-07-11 16:46:17.685', '2026-07-11 16:46:17.694', 'DUPR-12345', '@alexturner', 'facebook.com/alexturner', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (13, 'Marcus', 'Reed', 'marcus.reed@example.com', '$2b$10$C2FlyUk6hf64fYdp2Nd3IeStBpanQI/D10Q9yl8Ac0tl/iqNpZRWG', 'local', NULL, NULL, 38, 'male', '(303) 555-0200', false, 'a2598da74049b468f78fc10158ddcabe15b91e658a8d68adc6b0be14a7506223', NULL, NULL, '2026-07-12 16:46:17.951', 4.55, 0, '2026-07-11 16:46:17.951', '2026-07-11 16:46:17.954', 'DUPR-22345', '@marcusreed', 'facebook.com/marcusreed', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (14, 'Sofia', 'Ramirez', 'sofia.ramirez@example.com', '$2b$10$b2Mexc6IxER4poQNIZ2j/e5K5guZydBrLoMMwIHNAMkhe9OBki.4e', 'local', NULL, NULL, 33, 'female', '(303) 555-0201', false, 'a410d6f19ab97bade8a3f4b46e734db51a01b540dedf18ed4869b43ec5a34d89', NULL, NULL, '2026-07-12 16:46:18.011', 4.50, 0, '2026-07-11 16:46:18.011', '2026-07-11 16:46:18.014', 'DUPR-22346', '@sofiaramirez', 'facebook.com/sofiaramirez', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (15, 'Tyler', 'Brooks', 'tyler.brooks@example.com', '$2b$10$I3TIKUWfiYFTlIGfMqhZHermQS/nb7jnGvP99hSu6CIkR4fyoSPzK', 'local', NULL, NULL, 25, 'male', '(303) 555-0202', false, 'd9971e66acb3db37e6b3d87cde06b8179853e7b309de83477716fab4a3e3d998', NULL, NULL, '2026-07-12 16:46:18.069', 3.20, 0, '2026-07-11 16:46:18.069', '2026-07-11 16:46:18.072', 'DUPR-22347', '@tylerbrooks', 'facebook.com/tylerbrooks', 'Venmo', 'unpaid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (16, 'Emma', 'Fischer', 'emma.fischer@example.com', '$2b$10$9aLDLSdo0Dfr6aXOdWvNyO.8UJaXsYYl7WtpQAzlv33RBqGuNicC2', 'local', NULL, NULL, 24, 'female', '(303) 555-0203', false, 'b63122665fb1cfc140a4cebff7aa67a20f061b70d718359ddcf0c48fa4d0d190', NULL, NULL, '2026-07-12 16:46:18.128', 3.15, 0, '2026-07-11 16:46:18.128', '2026-07-11 16:46:18.131', 'DUPR-22348', '@emmafischer', 'facebook.com/emmafischer', 'Venmo', 'unpaid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (17, 'Carlos', 'Mendez', 'carlos.mendez@example.com', '$2b$10$1jGqXEUQRCcAahdFNHwqo.QdktmZHbA68xV0eyvwqTZYIgaca6XgW', 'local', NULL, NULL, 41, 'male', '(305) 555-0300', false, '7fbc0ad75f775f110f0eb0dc28bc90932d5c26bb1686b31affbe55df11a441af', NULL, NULL, '2026-07-12 16:46:18.187', 4.10, 0, '2026-07-11 16:46:18.187', '2026-07-11 16:46:18.192', 'DUPR-33345', '@carlosmendez', 'facebook.com/carlosmendez', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (18, 'Angela', 'Kim', 'angela.kim@example.com', '$2b$10$g71dQ/AUdMyRsWhOf3Mh/.EwcBGnNa7m3bqTTF.dV7gXWSmZAoZLK', 'local', NULL, NULL, 36, 'female', '(305) 555-0301', false, '8bb4d940b401158a80cd5b8e3d1a822b5370e36a130a130ddfd1bd7a03c9c583', NULL, NULL, '2026-07-12 16:46:18.247', 4.05, 0, '2026-07-11 16:46:18.247', '2026-07-11 16:46:18.25', 'DUPR-33346', '@angelakim', 'facebook.com/angelakim', 'Stripe', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (19, 'Jamal', 'Foster', 'jamal.foster@example.com', '$2b$10$.q2LEKeEIBe5BUzX7VqVl.bY9HhNjKjlCDo1wB5Ws9rq8MldyFWWm', 'local', NULL, NULL, 30, 'male', '(305) 555-0302', false, '94338fc08331e9a195872ed0fd7c700a850d8c90abe13277996cac7a8d78932a', NULL, NULL, '2026-07-12 16:46:18.304', 3.70, 0, '2026-07-11 16:46:18.304', '2026-07-11 16:46:18.307', 'DUPR-33347', '@jamalfoster', 'facebook.com/jamalfoster', 'PayPal', 'paid', 4);
INSERT INTO public.users (id, firstname, lastname, email, password, provider, "providerId", "profilePicture", age, gender, "phoneNumber", "isVerified", "verificationToken", "passwordResetToken", "passwordResetExpires", "accountExpiresAt", "duprRating", "tokenVersion", "createdAt", "updatedAt", "duprId", instagram, facebook, "paymentMethod", "paymentStatus", "roleId") VALUES (20, 'Rachel', 'Ostrowski', 'rachel.ostrowski@example.com', '$2b$10$TATSK60QRfLeiBDLrEHFjuYnp6Wtblj3KirT6orVc31kXxQOyM6Ca', 'local', NULL, NULL, 28, 'female', '(305) 555-0303', false, '39123cd65c07ecc05ab59aa4e952b21b3f00fb838ba5e3e66e8be79e23e799b0', NULL, NULL, '2026-07-12 16:46:18.364', 3.65, 0, '2026-07-11 16:46:18.364', '2026-07-11 16:46:18.367', 'DUPR-33348', '@rostrowski', 'facebook.com/rostrowski', 'PayPal', 'unpaid', 4);


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.clubs (id, name, location, "phoneNumber", "clubType", description, "hostId", "createdAt", "updatedAt") VALUES (1, 'Austin Pickleball Club', '1435 Main St, Austin, TX 78701', '(512) 555-0100', 'public', 'Sample club for local dev', 2, '2026-07-10 22:26:35.08', '2026-07-10 22:26:35.08');
INSERT INTO public.clubs (id, name, location, "phoneNumber", "clubType", description, "hostId", "createdAt", "updatedAt") VALUES (2, 'Dallas Pickleball Association', '8500 Preston Rd, Dallas, TX 75225', '(469) 555-0107', 'public', 'Second sample club for local dev', 2, '2026-07-10 22:26:35.082', '2026-07-10 22:26:35.082');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.events (id, "eventName", "createdAt", "updatedAt") VALUES (1, 'Boys Double''s', '2026-07-10 22:34:48.724', '2026-07-10 22:34:48.724');


--
-- Data for Name: playoffseedings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.playoffseedings (id, name, description, "createdAt", "updatedAt") VALUES (1, 'Standard', 'Traditional top-seed vs low-seed order', '2026-07-10 22:26:34.965', '2026-07-10 22:26:34.965');
INSERT INTO public.playoffseedings (id, name, description, "createdAt", "updatedAt") VALUES (2, 'Random', 'Randomized playoff order', '2026-07-10 22:26:34.966', '2026-07-10 22:26:34.966');


--
-- Data for Name: scoringlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (1, '1 game to 11, win by 1', '{"label": "1 game to 11, win by 1", "winBy": 1, "format": "single", "pointsTo": 11}', '2026-07-10 22:26:34.956', '2026-07-10 22:26:34.956');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (2, '1 game to 11, win by 2', '{"label": "1 game to 11, win by 2", "winBy": 2, "format": "single", "pointsTo": 11}', '2026-07-10 22:26:34.957', '2026-07-10 22:26:34.957');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (3, '1 game to 15, win by 1', '{"label": "1 game to 15, win by 1", "winBy": 1, "format": "single", "pointsTo": 15}', '2026-07-10 22:26:34.957', '2026-07-10 22:26:34.957');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (4, '1 game to 15, win by 2', '{"label": "1 game to 15, win by 2", "winBy": 2, "format": "single", "pointsTo": 15}', '2026-07-10 22:26:34.957', '2026-07-10 22:26:34.957');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (5, '1 game to 21, win by 1', '{"label": "1 game to 21, win by 1", "winBy": 1, "format": "single", "pointsTo": 21}', '2026-07-10 22:26:34.958', '2026-07-10 22:26:34.958');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (6, '1 game to 21, win by 2', '{"label": "1 game to 21, win by 2", "winBy": 2, "format": "single", "pointsTo": 21}', '2026-07-10 22:26:34.958', '2026-07-10 22:26:34.958');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (7, 'Best of 3 to 11, win by 1', '{"games": 3, "label": "Best of 3 to 11, win by 1", "winBy": 1, "format": "best_of", "pointsTo": 11}', '2026-07-10 22:26:34.959', '2026-07-10 22:26:34.959');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (8, 'Best of 3 to 11, win by 2', '{"games": 3, "label": "Best of 3 to 11, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 11}', '2026-07-10 22:26:34.959', '2026-07-10 22:26:34.959');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (9, 'Best of 3 to 15, win by 1', '{"games": 3, "label": "Best of 3 to 15, win by 1", "winBy": 1, "format": "best_of", "pointsTo": 15}', '2026-07-10 22:26:34.959', '2026-07-10 22:26:34.959');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (10, 'Best of 3 to 15, win by 2', '{"games": 3, "label": "Best of 3 to 15, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 15}', '2026-07-10 22:26:34.96', '2026-07-10 22:26:34.96');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (11, 'Best of 3 to 21, win by 2', '{"games": 3, "label": "Best of 3 to 21, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 21}', '2026-07-10 22:26:34.96', '2026-07-10 22:26:34.96');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (12, 'Best of 5 to 11, win by 2', '{"games": 5, "label": "Best of 5 to 11, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 11}', '2026-07-10 22:26:34.961', '2026-07-10 22:26:34.961');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (13, 'Best of 5 to 15, win by 2', '{"games": 5, "label": "Best of 5 to 15, win by 2", "winBy": 2, "format": "best_of", "pointsTo": 15}', '2026-07-10 22:26:34.961', '2026-07-10 22:26:34.961');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (14, 'Rally scoring to 21, win by 2', '{"label": "Rally scoring to 21, win by 2", "winBy": 2, "format": "single", "pointsTo": 21}', '2026-07-10 22:26:34.961', '2026-07-10 22:26:34.961');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (15, 'Rally scoring to 25, win by 2', '{"label": "Rally scoring to 25, win by 2", "winBy": 2, "format": "single", "pointsTo": 25}', '2026-07-10 22:26:34.962', '2026-07-10 22:26:34.962');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (16, 'Timed match — 20 min, point capped', '{"label": "Timed match — 20 min, point capped", "format": "timed", "minutes": 20}', '2026-07-10 22:26:34.962', '2026-07-10 22:26:34.962');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (17, 'Timed match — 30 min, point capped', '{"label": "Timed match — 30 min, point capped", "format": "timed", "minutes": 30}', '2026-07-10 22:26:34.963', '2026-07-10 22:26:34.963');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (18, 'Rally Scoring', '{"label": "Rally Scoring", "winBy": 1, "format": "single", "pointsTo": 11}', '2026-07-10 22:26:34.964', '2026-07-10 22:26:34.964');
INSERT INTO public.scoringlists (id, name, rules, "createdAt", "updatedAt") VALUES (19, 'Side-out Scoring', '{"label": "Side-out Scoring", "winBy": 1, "format": "single", "pointsTo": 11}', '2026-07-10 22:26:34.964', '2026-07-10 22:26:34.964');


--
-- Data for Name: tournaments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tournaments (id, name, description, "entryFee", discount, "tournamentTumbnail", location, "startDate", "endDate", "registrationOpenDate", "registrationCloseDate", status, "organizerInfo", slug, venue, timezone, "refundDeadline", "refundFee", "duprRecorded", "duprEnforced", "requireSkillRating", "clubId", "hostId", "createdAt", "updatedAt") VALUES (1, 'Muku pb open', 'great tournament', 0.00, 0, 'tournaments/1/banner/ba2e7684-ec18-4fe0-85da-3349f6c8d218.png', '1435 Main St, Austin, TX 78701', '2026-07-20', '2026-07-22', '2026-07-14', '2026-07-15', 'draft', '{"name":"Mukundan","email":"mukundaniyengar20@gmail.com","phone":"(512) 555-0100","masterPush":false,"numCourts":8,"playEnv":"","netSetup":"Permanent","courtDescription":"","paddlePolicyText":"Only USAPA & UPA-A approved paddles are allowed\n\nUSA Pickleball \"delisted\" the following paddles; Joola: Preseus 14mm Mod TA-15, Preseus 16mm Mod TA-15, Gearbox: Pro Power Elongated, Pro Kennex: Black Ace Ovation, Black Ace Pro, and Black Ace XF which players WILL NOT be allowed to use during medal matches. Selkirk Boomstick Elongated is allowed.\n\nSince this is an amateur-only event, we will give players the opportunity to switch paddles (or choose to forfeit) rather than default to a forfeited game as stated in the USAPA rules, especially in light of paddles with an approved stamp that are no longer on the approved list.\n\nOur event will follow USAPA rules (see: https://usapickleball.org/what-is-pickleball/official-rules/). Players may ask any questions they have or report any violations at the tournament desk. The tournament director may use their discretion in interpreting or modifying the USAPA rules to suit the specific scenario and ensure fun/competitive play.","officialBall":"","officialBallUrl":"","paymentPhone":"","zelleUsername":"","venmoUsername":"","settingsConfirmed":false,"settingsConfirmedAt":null,"sectionPush":{"pricing":false,"playRules":false,"dupr":false},"pricing":{"payForPartner":{"enabled":false,"mode":"optional"},"payForTeam":{"enabled":false,"mode":"optional"},"advanceTiers":[{"id":"tier-1783722734275-21","label":"Early Bird","pricePerPlayer":50,"activeUntil":""},{"id":"tier-1783722734275-22","label":"Advance Rate","pricePerPlayer":55,"activeUntil":""},{"id":"tier-1783722734275-23","label":"Pre-Deadline","pricePerPlayer":65,"activeUntil":""}],"bundles":[{"id":"tier-1783722734275-24","divisionCount":2,"mode":"pct","value":10},{"id":"tier-1783722734275-25","divisionCount":3,"mode":"pct","value":15}],"prizes":{"first":"","second":"","third":"","medalsAwards":true}},"playRules":{"mlpFormat":true,"mlp":{"mensDoubles":"1 game to 11, win by 2","womensDoubles":"1 game to 11, win by 2","mixed1":"1 game to 11, win by 2","mixed2":"1 game to 11, win by 2","dreamBreaker":"1 game to 21, win by 1","rotation":"Singles rally — 1 server switches every 4 pts","trigger":"Only when games tied 2–2","rosterSize":"6 players (2M + 2F starters + 1M + 1F sub)","gameOrder":"Women''s D → Men''s D → Mixed 1 → Mixed 2","pointsPerGameWon":1,"scoringType":"Traditional (side-out)","warmUpMinutes":3,"substitutions":true,"coachOnCourt":true,"teamTimeouts":true},"matchScoring":{"pool":"1 game to 15, win by 2","playoff":"1 game to 15, win by 2","semi":"1 game to 15, win by 2","gold":"Best of 3 to 11, win by 2","bronze":"1 game to 15, win by 2"},"scoringType":"Traditional (side-out)","suddenDeathAt":"","suddenDeathWinAt":"","warmUpMinutes":3,"seedingMethod":"DUPR Rating (highest rating = 1 seed)","autoGeneratePools":true,"tiebreakerTo5":false,"switchSidesAtHalf":false,"top1SeedBye":false,"top12AdvanceToSemis":false,"allowRefereeRequests":false,"bronzeMatch":false},"notifications":{"matchNotifications":true,"liveScoring":true,"emailNotifications":true,"courtAssignmentText":false},"visibility":{"publicTournamentPage":true,"privateOnly":false,"showDivisionsPublicly":true,"spectatorScoreboard":true,"passwordProtected":false,"registrationPassword":"","waitlistEnabled":true},"tournamentInfo":{"refundPolicy":{"fullWindow":"Players or clubs receive a full refund up until the week before the tournament date. No refunds are issued after that.","replacement":"Players with a replacement can swap by reaching out to us.","questions":"Reach out to JOMG Pickleball at info@jomgpickleball.com."},"spectators":{"ticketFee":0,"maxCapacity":""},"duprRequirementsText":"","duprRequirementsManual":false,"playerInstructions":[{"label":"Stay & Travel","text":""},{"label":"On-Site Food","text":""},{"label":"Parking & Arrival","text":""},{"label":"What to Bring","text":""},{"label":"Waiver / Liability","text":""}],"sponsors":{"intro":"","tiers":{"title":{"items":[{"id":"spon-1783722754557-51","name":"","url":"","logoKey":"","logoUrl":"","darkLogo":false}]},"ball":{"items":[]},"championshipCourt":{"items":[]},"hydration":{"items":[]},"division":{"items":[]}}},"organizerOverride":false}}', 'muku-pb-open', 'Austin Pickleball Club', 'America/New_York', NULL, 0.00, true, false, false, 1, 2, '2026-07-10 22:32:14.353', '2026-07-10 22:32:43.702');


--
-- Data for Name: brackets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.brackets (id, name, "maxTeams", "minAge", "maxAge", "minRating", "maxRating", "bracketFormatId", "scoringListId", "playoffSeedingId", "playoffMatchId", "semiFinalMatchId", "bronzeMatchId", "goldMatchId", "roundId", "tournamentId", "eventId", "poolStarted", status, "startDate", "startTime", "endDate", "registrationFee", "scoringConfig", "createdAt", "updatedAt", division) VALUES (1, 'mixed doubles', 16, 0, 0, 0.00, 0.00, 1, 4, 1, 4, 4, 4, 8, 4, 1, 1, false, 'draft', '2026-07-20', NULL, '2026-07-22', 0.00, '{"gold": {"label": "Best of 3 to 11, win by 2", "scoringListId": 8}, "pool": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "semi": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "bronze": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "playoff": {"label": "1 game to 15, win by 2", "scoringListId": 4}, "showPublic": true, "skillLevel": "", "accentColor": "#AAFF00", "duprEnforced": false, "duprRecorded": true, "matchScoring": {"pool": "1 game to 11, win by 1", "playoff": "1 game to 11, win by 1"}, "teamsPerPool": 4, "registrationOn": true, "duprCombinedMax": null, "duprCombinedMin": null, "useGlobalSettings": true}', '2026-07-10 22:34:48.73', '2026-07-11 16:48:40.458', NULL);


--
-- Data for Name: Pool; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Pool" (id, "poolName", "bracketId", "tournamentId", "createdAt", "updatedAt") VALUES (3, 'Pool A', 1, 1, '2026-07-11 16:48:02.173', '2026-07-11 16:48:02.173');


--
-- Data for Name: rounds; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.rounds (id, "poolId", "roundNumber", status, "bracketId", type, "createdAt", "updatedAt") VALUES (7, 3, 1, 'pending', 1, 'pool', '2026-07-11 16:48:02.188', '2026-07-11 16:48:02.188');
INSERT INTO public.rounds (id, "poolId", "roundNumber", status, "bracketId", type, "createdAt", "updatedAt") VALUES (8, 3, 2, 'pending', 1, 'pool', '2026-07-11 16:48:02.196', '2026-07-11 16:48:02.196');
INSERT INTO public.rounds (id, "poolId", "roundNumber", status, "bracketId", type, "createdAt", "updatedAt") VALUES (9, 3, 3, 'pending', 1, 'pool', '2026-07-11 16:48:02.212', '2026-07-11 16:48:02.212');


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.teams (id, "teamName", "bracketId", "tournamentId", status, "paymentStatus", "isComplete", "createdAt", "updatedAt") VALUES (1, 'JOMG', 1, 1, 'checked-in', 'unpaid', false, '2026-07-10 22:38:12.287', '2026-07-11 16:54:45.719');
INSERT INTO public.teams (id, "teamName", "bracketId", "tournamentId", status, "paymentStatus", "isComplete", "createdAt", "updatedAt") VALUES (2, 'Team Thunderbolts', 1, 1, 'checked-in', 'paid', false, '2026-07-11 16:46:17.7', '2026-07-11 16:54:47.006');
INSERT INTO public.teams (id, "teamName", "bracketId", "tournamentId", status, "paymentStatus", "isComplete", "createdAt", "updatedAt") VALUES (3, 'Team Firehawks', 1, 1, 'checked-in', 'paid', false, '2026-07-11 16:46:17.958', '2026-07-11 16:54:48.137');
INSERT INTO public.teams (id, "teamName", "bracketId", "tournamentId", status, "paymentStatus", "isComplete", "createdAt", "updatedAt") VALUES (4, 'Team Ironclad', 1, 1, 'checked-in', 'paid', false, '2026-07-11 16:46:18.195', '2026-07-11 16:54:49.23');


--
-- Data for Name: Matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Matches" (id, "team1Id", "team2Id", "poolId", "roundId", status, "scoreTeam1", "scoreTeam2", type, "winnerTeamId", "loserTeamId", "createdAt", "updatedAt") VALUES (13, 1, 4, 3, 7, 'not_started', 0, 0, 'pool', NULL, NULL, '2026-07-11 16:48:02.192', '2026-07-11 16:48:02.192');
INSERT INTO public."Matches" (id, "team1Id", "team2Id", "poolId", "roundId", status, "scoreTeam1", "scoreTeam2", type, "winnerTeamId", "loserTeamId", "createdAt", "updatedAt") VALUES (14, 2, 3, 3, 7, 'not_started', 0, 0, 'pool', NULL, NULL, '2026-07-11 16:48:02.192', '2026-07-11 16:48:02.192');
INSERT INTO public."Matches" (id, "team1Id", "team2Id", "poolId", "roundId", status, "scoreTeam1", "scoreTeam2", type, "winnerTeamId", "loserTeamId", "createdAt", "updatedAt") VALUES (15, 1, 3, 3, 8, 'not_started', 0, 0, 'pool', NULL, NULL, '2026-07-11 16:48:02.204', '2026-07-11 16:48:02.204');
INSERT INTO public."Matches" (id, "team1Id", "team2Id", "poolId", "roundId", status, "scoreTeam1", "scoreTeam2", type, "winnerTeamId", "loserTeamId", "createdAt", "updatedAt") VALUES (16, 4, 2, 3, 8, 'not_started', 0, 0, 'pool', NULL, NULL, '2026-07-11 16:48:02.204', '2026-07-11 16:48:02.204');
INSERT INTO public."Matches" (id, "team1Id", "team2Id", "poolId", "roundId", status, "scoreTeam1", "scoreTeam2", type, "winnerTeamId", "loserTeamId", "createdAt", "updatedAt") VALUES (17, 1, 2, 3, 9, 'not_started', 0, 0, 'pool', NULL, NULL, '2026-07-11 16:48:02.214', '2026-07-11 16:48:02.214');
INSERT INTO public."Matches" (id, "team1Id", "team2Id", "poolId", "roundId", status, "scoreTeam1", "scoreTeam2", type, "winnerTeamId", "loserTeamId", "createdAt", "updatedAt") VALUES (18, 3, 4, 3, 9, 'not_started', 0, 0, 'pool', NULL, NULL, '2026-07-11 16:48:02.214', '2026-07-11 16:48:02.214');


--
-- Data for Name: PoolTeam; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."PoolTeam" ("poolId", "teamId", "createdAt", "updatedAt") VALUES (3, 1, '2026-07-11 16:48:02.176', '2026-07-11 16:48:02.176');
INSERT INTO public."PoolTeam" ("poolId", "teamId", "createdAt", "updatedAt") VALUES (3, 2, '2026-07-11 16:48:02.178', '2026-07-11 16:48:02.178');
INSERT INTO public."PoolTeam" ("poolId", "teamId", "createdAt", "updatedAt") VALUES (3, 3, '2026-07-11 16:48:02.18', '2026-07-11 16:48:02.18');
INSERT INTO public."PoolTeam" ("poolId", "teamId", "createdAt", "updatedAt") VALUES (3, 4, '2026-07-11 16:48:02.184', '2026-07-11 16:48:02.184');


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('a751109b-cb99-42d0-9d2e-145517501928', '13940eb0d23816e3698646463311d2f4796e6411635f606389501b13e82eeb94', '2026-07-11 21:22:28.445379+00', '20260506170000_init', '', NULL, '2026-07-11 21:22:28.445379+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('23e09191-f171-4aa5-97a4-625d40397a46', '62c6b84ac32436234b8719176146e61cec42bafa2c5bb20d23b9cee809b5ff5d', '2026-07-11 21:22:28.897538+00', '20260506184000_add_user_token_version', '', NULL, '2026-07-11 21:22:28.897538+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('983943ef-c4f4-4bfa-a36b-f326205f233b', '9004b0002bc4b006fd69daf152f669567bdb06240f8832de72a030c7967cc8fc', '2026-07-11 21:22:29.348421+00', '20260506223000_add_auth_roles', '', NULL, '2026-07-11 21:22:29.348421+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('95a4e959-0638-4bb8-8c9a-7e0b9ffe41f2', 'a4fdd3b38162e70dd44cb94f09bf84c7eb753f35a489dbeca7caea91434c8678', '2026-07-11 21:22:29.802791+00', '20260516120000_tournament_wizard_fields', '', NULL, '2026-07-11 21:22:29.802791+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('38351315-ad69-4f6f-be46-1151b7ccdcfc', 'c41b9ea1b5d883e14e96d32dcdf8cd40e0c1e8c834fcb493b6557d3bd86c5c83', '2026-07-11 21:22:30.257924+00', '20260524120000_payment_email_sent_count', '', NULL, '2026-07-11 21:22:30.257924+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('1b4829d2-172c-4fc6-9e30-44b0f6c308cd', '0a831b3053304db15d591919162e32e497f8b10e9df0396519c0a4edf88f1b36', '2026-07-11 21:22:30.719542+00', '20260525120000_scoring_config', '', NULL, '2026-07-11 21:22:30.719542+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('b0f25e05-b70a-4202-8884-6d080f33948a', '64b227e3cb58d71c01ad907d2a1584f577c774ff4f016f41b97abf992bbdd9fb', '2026-07-11 21:22:31.183481+00', '20260526120000_registration_partner_id', '', NULL, '2026-07-11 21:22:31.183481+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('168a3934-0c32-4c70-88e1-2455434b2bf8', '2af0fb93591983767809204e0577ec02501254895eea3f799e29a213a54a34fb', '2026-07-11 21:22:31.647194+00', '20260527120000_dupr_rating_decimal', '', NULL, '2026-07-11 21:22:31.647194+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('1f10cf02-c7bc-4072-9f3a-02c468b44c62', '813f912055f00abe86311171b840640763871479b5cbbca160f78b8c3fb12bb0', '2026-07-11 21:22:32.143761+00', '20260527211306_add_new_columns', '', NULL, '2026-07-11 21:22:32.143761+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('995c3123-2ed9-4193-b1c4-21f396822246', 'bdd254f0578fb2ddec965762a5bbfc259746205ca8abc3ea9e760cdc5a2b2e5c', '2026-07-11 21:22:32.59739+00', '20260529191244_additional_player_regcolumns', '', NULL, '2026-07-11 21:22:32.59739+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('520bf211-58b0-43e3-8e13-367492724086', '5c9761cf109be8665e06f230e541955e7a25563a392a099518cd879ec394c97e', '2026-07-11 21:22:33.04917+00', '20260530163121_remove_phone_number_unique_user', '', NULL, '2026-07-11 21:22:33.04917+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('218ddb97-73ed-4de2-bd9e-eca99d5a6269', 'cbe0df0f758b8f33c08bcb6ed8d5fbaaf576593d133b3b93c22a73ee4bdfccd7', '2026-07-11 21:22:33.506086+00', '20260530172550_add_role_id_to_users', '', NULL, '2026-07-11 21:22:33.506086+00', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('14308308-d0b9-403d-a068-44ad9ff7cd13', '14be570704548db23376288ff9f5894f2668d9e5aad8a3b6a0bd1b084f24dc13', '2026-07-11 21:22:33.963419+00', '20260630120000_bracket_start_time', '', NULL, '2026-07-11 21:22:33.963419+00', 0);


--
-- Data for Name: formats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.formats (id, name, "createdAt", "updatedAt") VALUES (1, 'Double''s', '2026-07-10 22:26:34.939', '2026-07-10 22:26:34.939');
INSERT INTO public.formats (id, name, "createdAt", "updatedAt") VALUES (2, 'Single''s', '2026-07-10 22:26:34.942', '2026-07-10 22:26:34.942');
INSERT INTO public.formats (id, name, "createdAt", "updatedAt") VALUES (3, 'MLP', '2026-07-10 22:26:34.943', '2026-07-10 22:26:34.943');
INSERT INTO public.formats (id, name, "createdAt", "updatedAt") VALUES (4, 'Triples', '2026-07-10 22:26:34.944', '2026-07-10 22:26:34.944');


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.groups (id, name, "createdAt", "updatedAt") VALUES (1, 'Men''s', '2026-07-10 22:26:34.945', '2026-07-10 22:26:34.945');
INSERT INTO public.groups (id, name, "createdAt", "updatedAt") VALUES (2, 'Women''s', '2026-07-10 22:26:34.947', '2026-07-10 22:26:34.947');
INSERT INTO public.groups (id, name, "createdAt", "updatedAt") VALUES (3, 'Mixed', '2026-07-10 22:26:34.948', '2026-07-10 22:26:34.948');
INSERT INTO public.groups (id, name, "createdAt", "updatedAt") VALUES (4, 'Boys', '2026-07-10 22:26:34.949', '2026-07-10 22:26:34.949');
INSERT INTO public.groups (id, name, "createdAt", "updatedAt") VALUES (5, 'Girls', '2026-07-10 22:26:34.95', '2026-07-10 22:26:34.95');
INSERT INTO public.groups (id, name, "createdAt", "updatedAt") VALUES (6, 'Junior', '2026-07-10 22:26:34.951', '2026-07-10 22:26:34.951');
INSERT INTO public.groups (id, name, "createdAt", "updatedAt") VALUES (7, 'Co-Ed', '2026-07-10 22:26:34.951', '2026-07-10 22:26:34.951');


--
-- Data for Name: playerbrackets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: playerregistrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (9, 11, 12, 1, 1, 'registered', 'unpaid', 0, 'checked_in', '2026-07-11 16:54:46.996', '2026-07-11 16:46:17.837', '2026-07-11 16:54:46.996', 'M3', 'starter', 'Austin Pickle Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (12, 14, 13, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:47.577', '2026-07-11 16:46:18.016', '2026-07-11 16:54:47.577', 'F2', 'starter', 'Denver Smash Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (11, 13, 14, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:47.579', '2026-07-11 16:46:17.956', '2026-07-11 16:54:47.579', 'F1', 'starter', 'Denver Smash Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (14, 16, 15, 1, 1, 'registered', 'unpaid', 0, 'checked_in', '2026-07-11 16:54:48.127', '2026-07-11 16:46:18.133', '2026-07-11 16:54:48.127', 'F4', 'substitute', 'Denver Smash Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (13, 15, 16, 1, 1, 'registered', 'unpaid', 0, 'checked_in', '2026-07-11 16:54:48.129', '2026-07-11 16:46:18.075', '2026-07-11 16:54:48.129', 'F3', 'substitute', 'Denver Smash Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (16, 18, 17, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:48.717', '2026-07-11 16:46:18.251', '2026-07-11 16:54:48.717', 'I2', 'starter', 'Miami Paddle Society', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (15, 17, 18, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:48.719', '2026-07-11 16:46:18.193', '2026-07-11 16:54:48.719', 'I1', 'starter', 'Miami Paddle Society', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (18, 20, 19, 1, 1, 'registered', 'unpaid', 0, 'checked_in', '2026-07-11 16:54:49.218', '2026-07-11 16:46:18.369', '2026-07-11 16:54:49.218', 'I4', 'starter', 'Miami Paddle Society', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (2, 4, 3, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:44.798', '2026-07-10 22:38:12.354', '2026-07-11 16:54:44.799', 'M2', 'starter', 'Austin Pickleball Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (17, 19, 20, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:49.22', '2026-07-11 16:46:18.31', '2026-07-11 16:54:49.221', 'I3', 'starter', 'Miami Paddle Society', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (1, 3, 4, 1, 1, 'registered', 'unpaid', 0, 'checked_in', '2026-07-11 16:54:44.804', '2026-07-10 22:38:12.285', '2026-07-11 16:54:44.804', 'M1', 'starter', 'Austin Pickleball Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (4, 6, 5, 1, 1, 'registered', 'unpaid', 0, 'checked_in', '2026-07-11 16:54:45.71', '2026-07-10 22:38:12.474', '2026-07-11 16:54:45.71', 'M4', 'starter', 'Austin Pickleball Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (3, 5, 6, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:45.712', '2026-07-10 22:38:12.413', '2026-07-11 16:54:45.712', 'M3', 'starter', 'Austin Pickleball Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (8, 10, 9, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:46.276', '2026-07-11 16:46:17.777', '2026-07-11 16:54:46.276', 'M2', 'starter', 'Austin Pickle Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (7, 9, 10, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:46.277', '2026-07-11 16:46:17.697', '2026-07-11 16:54:46.277', 'M1', 'starter', 'Austin Pickle Club', 'Mixed Doubles');
INSERT INTO public.playerregistrations (id, "playerId", "partnerId", "tournamentId", "bracketId", status, "paymentStatus", "paymentEmailSentCount", "checkInStatus", "checkInTime", "createdAt", "updatedAt", "rosterNumber", "playerRole", "clubName", division) VALUES (10, 12, 11, 1, 1, 'registered', 'paid', 0, 'checked_in', '2026-07-11 16:54:46.993', '2026-07-11 16:46:17.896', '2026-07-11 16:54:46.993', 'M4', 'starter', 'Austin Pickle Club', 'Mixed Doubles');


--
-- Data for Name: poolteamstats; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: teamplayers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (1, 3, 1, 'player', '2026-07-10 22:38:12.291', '2026-07-10 22:38:12.291');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (2, 4, 1, 'player', '2026-07-10 22:38:12.357', '2026-07-10 22:38:12.357');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (3, 5, 1, 'player', '2026-07-10 22:38:12.416', '2026-07-10 22:38:12.416');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (4, 6, 1, 'player', '2026-07-10 22:38:12.476', '2026-07-10 22:38:12.476');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (7, 9, 2, 'player', '2026-07-11 16:46:17.703', '2026-07-11 16:46:17.703');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (8, 10, 2, 'player', '2026-07-11 16:46:17.78', '2026-07-11 16:46:17.78');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (9, 11, 2, 'player', '2026-07-11 16:46:17.839', '2026-07-11 16:46:17.839');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (10, 12, 2, 'player', '2026-07-11 16:46:17.9', '2026-07-11 16:46:17.9');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (11, 13, 3, 'player', '2026-07-11 16:46:17.96', '2026-07-11 16:46:17.96');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (12, 14, 3, 'player', '2026-07-11 16:46:18.018', '2026-07-11 16:46:18.018');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (13, 15, 3, 'player', '2026-07-11 16:46:18.077', '2026-07-11 16:46:18.077');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (14, 16, 3, 'player', '2026-07-11 16:46:18.135', '2026-07-11 16:46:18.135');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (15, 17, 4, 'player', '2026-07-11 16:46:18.196', '2026-07-11 16:46:18.196');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (16, 18, 4, 'player', '2026-07-11 16:46:18.254', '2026-07-11 16:46:18.254');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (17, 19, 4, 'player', '2026-07-11 16:46:18.312', '2026-07-11 16:46:18.312');
INSERT INTO public.teamplayers (id, "playerId", "teamId", role, "createdAt", "updatedAt") VALUES (18, 20, 4, 'player', '2026-07-11 16:46:18.372', '2026-07-11 16:46:18.372');


--
-- Data for Name: userroles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (1, 1, 6, '2026-07-10 22:26:35.069', '2026-07-10 22:26:35.069');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (2, 2, 5, '2026-07-10 22:26:35.076', '2026-07-10 22:26:35.076');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (3, 3, 4, '2026-07-10 22:38:12.28', '2026-07-10 22:38:12.28');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (4, 4, 4, '2026-07-10 22:38:12.351', '2026-07-10 22:38:12.351');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (5, 5, 4, '2026-07-10 22:38:12.41', '2026-07-10 22:38:12.41');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (6, 6, 4, '2026-07-10 22:38:12.469', '2026-07-10 22:38:12.469');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (7, 7, 4, '2026-07-10 22:38:12.531', '2026-07-10 22:38:12.531');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (8, 8, 4, '2026-07-10 22:38:12.589', '2026-07-10 22:38:12.589');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (9, 9, 4, '2026-07-11 16:46:17.692', '2026-07-11 16:46:17.692');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (10, 10, 4, '2026-07-11 16:46:17.771', '2026-07-11 16:46:17.771');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (11, 11, 4, '2026-07-11 16:46:17.834', '2026-07-11 16:46:17.834');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (12, 12, 4, '2026-07-11 16:46:17.894', '2026-07-11 16:46:17.894');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (13, 13, 4, '2026-07-11 16:46:17.952', '2026-07-11 16:46:17.952');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (14, 14, 4, '2026-07-11 16:46:18.013', '2026-07-11 16:46:18.013');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (15, 15, 4, '2026-07-11 16:46:18.071', '2026-07-11 16:46:18.071');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (16, 16, 4, '2026-07-11 16:46:18.13', '2026-07-11 16:46:18.13');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (17, 17, 4, '2026-07-11 16:46:18.191', '2026-07-11 16:46:18.191');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (18, 18, 4, '2026-07-11 16:46:18.249', '2026-07-11 16:46:18.249');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (19, 19, 4, '2026-07-11 16:46:18.306', '2026-07-11 16:46:18.306');
INSERT INTO public.userroles (id, "userId", "roleId", "createdAt", "updatedAt") VALUES (20, 20, 4, '2026-07-11 16:46:18.366', '2026-07-11 16:46:18.366');


--
-- Name: Matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Matches_id_seq"', 18, true);


--
-- Name: Pool_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Pool_id_seq"', 3, true);


--
-- Name: bracketformats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bracketformats_id_seq', 4, true);


--
-- Name: brackets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brackets_id_seq', 1, true);


--
-- Name: clubs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clubs_id_seq', 2, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 1, true);


--
-- Name: formats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formats_id_seq', 4, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 7, true);


--
-- Name: playerbrackets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playerbrackets_id_seq', 1, false);


--
-- Name: playerregistrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playerregistrations_id_seq', 18, true);


--
-- Name: playoffseedings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playoffseedings_id_seq', 2, true);


--
-- Name: poolteamstats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.poolteamstats_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: rounds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rounds_id_seq', 9, true);


--
-- Name: scoringlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scoringlists_id_seq', 19, true);


--
-- Name: teamplayers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teamplayers_id_seq', 18, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 4, true);


--
-- Name: tournaments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tournaments_id_seq', 1, true);


--
-- Name: userroles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.userroles_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 20, true);


--
-- PostgreSQL database dump complete
--

\unrestrict mMOlsDqrPhWGYYLKG29j1PNKzW0uzdDmgABC4UySFCj3ZmPqzsl58Hjuyt80zNl

