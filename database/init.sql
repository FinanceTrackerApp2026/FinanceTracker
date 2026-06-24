-- A contact can have multiple phone numbers,
-- loans, properties and reminders.
-- =====================================================

CREATE TABLE contacts (
id SERIAL PRIMARY KEY,
customer_code VARCHAR(20) UNIQUE NOT NULL,
full_name VARCHAR(100) NOT NULL,
address TEXT,
occupation VARCHAR(100),
notes TEXT,
status VARCHAR(20) DEFAULT 'ACTIVE',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A contact can have multiple phone numbers.
-- =====================================================

CREATE TABLE icontact_numbers (
id SERIAL PRIMARY KEY,
contact_id INT NOT NULL,
phone_number VARCHAR(20) NOT NULL,
label VARCHAR(30) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_contact_numbers_contact
    FOREIGN KEY (contact_id)
    REFERENCES contacts(id)

);

-- A contact can have multiple loans.

-- Related tables:
-- payments
-- interest_ledger
-- securities
-- reminders
-- =====================================================

CREATE TABLE loans (
id SERIAL PRIMARY KEY,
contact_id INT NOT NULL,
loan_reference VARCHAR(30) UNIQUE NOT NULL,
loan_type VARCHAR(20) NOT NULL,
interest_type VARCHAR(30) NOT NULL,
principal_amount DECIMAL(15,2) NOT NULL,
outstanding_principal DECIMAL(15,2) NOT NULL,
interest_rate DECIMAL(5,2) NOT NULL,
interest_frequency VARCHAR(20) NOT NULL,
loan_date DATE NOT NULL,
due_day INT,
has_security BOOLEAN DEFAULT FALSE,
status VARCHAR(20) DEFAULT 'ACTIVE',
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_loans_contact
    FOREIGN KEY (contact_id)
    REFERENCES contacts(id)

);