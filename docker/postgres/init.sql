-- Enable logical replication
ALTER SYSTEM SET wal_level = logical;

-- Create publication for Electric
CREATE PUBLICATION electric_pub FOR ALL TABLES;