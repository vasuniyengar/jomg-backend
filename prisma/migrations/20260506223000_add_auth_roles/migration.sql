INSERT INTO "roles" ("name", "createdAt", "updatedAt")
VALUES
  ('organizer', NOW(), NOW()),
  ('super_admin', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;
