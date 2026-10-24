ALTER TABLE finance_queries RENAME COLUMN phone TO whatsapp;
UPDATE finance_queries SET preferred_contact = 'WHATSAPP' WHERE preferred_contact = 'PHONE';
