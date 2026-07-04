

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    contact_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    occupation VARCHAR(100),
    contact_type VARCHAR(20)
        CHECK (contact_type IN ('PERSON', 'COMPANY', 'BANK'))
        DEFAULT 'PERSON',
    notes TEXT,
    status VARCHAR(20)
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
        DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


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
    loan_tenure INT,
    tenure_unit VARCHAR(10)
        CHECK (tenure_unit IN ('MONTH', 'YEAR'))
        DEFAULT 'MONTH',

    has_security BOOLEAN DEFAULT FALSE,
    status VARCHAR(20)
        CHECK (status IN ('ACTIVE', 'CLOSED'))
        DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loans_contact
        FOREIGN KEY (contact_id)
        REFERENCES contacts(id)
        ON DELETE RESTRICT
);



CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    loan_id INT NOT NULL,
    payment_date DATE NOT NULL,
    payment_amount DECIMAL(15,2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20),
    transaction_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_loan
    FOREIGN KEY (loan_id)
    REFERENCES loans(id)
    ON DELETE CASCADE
);