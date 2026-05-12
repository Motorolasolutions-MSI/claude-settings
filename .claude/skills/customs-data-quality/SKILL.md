---
name: customs-data-quality
description: Use when evaluating a US customs broker's data accuracy and quality controls — HTSUS 10-digit classification database/audits, post-summary review inside the 10-day pre-liquidation window on CBP Form 7501, IOR access to the ACE portal, and explicit PGA (FDA, EPA, USDA, FCC, etc.) data-filing responsibility. Triggers include "HTS classification", "tariff classification audit", "CBP Form 7501", "post-summary correction", "PSC", "ACE portal", "PGA", "partner government agency", "FDA prior notice", "EPA TSCA", or any request to vet the broker's data-quality controls before liquidation.
---

# Data Accuracy & Quality Control Requirements

Liquidation is the moment CBP's view of the entry becomes final. Errors caught before liquidation are corrected cheaply with a Post-Summary Correction (PSC); errors caught after liquidation usually require a §1520 protest or a prior disclosure. These four controls keep mistakes inside the cheap window.

## Checklist

### 1. Classification Maintenance (HTSUS)

- Broker maintains an **HTSUS classification database** keyed by the IOR's part numbers, with every active product mapped to a **validated 10-digit subheading** (statistical suffix included).
- Each classification record includes: General Rules of Interpretation (GRI) rationale, supporting product information (datasheet, BOM, photo), date of last review, and the licensed broker who signed off.
- **Regular HTS audits** at a defined cadence (annual at minimum; quarterly for high-volume or high-duty parts).
- New parts are classified **before** first import, not after entry has been filed under a "best guess" code.

### 2. Post-Summary Review (CBP Form 7501)

- Broker performs a **documented post-summary review** of every CBP Form 7501 (Entry Summary) within the **10 calendar days after release** — the window before the entry summary becomes the basis for duty calculation and liquidation.
- Review covers: HTSUS code, duty rate and calculation, customs value, MPF/HMF, country of origin, FTA claim accuracy, ADD/CVD case numbers, PGA disclaimers.
- Any error found in the review is corrected via **PSC** before liquidation (not after) — turnaround under 5 business days from discovery.
- A signed checklist is retained in the entry packet as evidence the review occurred.

### 3. ACE Portal Access

- Broker **facilitates IOR access to the Automated Commercial Environment (ACE) portal** — including setting up the IOR's ACE account if it does not exist, attaching the IOR's filer identifier, and configuring the appropriate reports.
- IOR retains the ability to **independently monitor**: entry summaries, duty payments, periodic monthly statement (PMS) status, liquidation status, and any CBP flags or census warnings — without depending on the broker forwarding screenshots.
- IOR users are real named users with their own credentials; the broker is **not** the sole holder of the IOR's ACE login.

### 4. Partner Government Agency (PGA) Handling

- The SOW contains an **explicit PGA matrix** naming every agency in scope for the IOR's products. Common ones:
  - **FDA** — food, drug, device, cosmetic; Prior Notice for food
  - **EPA** — TSCA Section 13 certifications, pesticides (FIFRA), vehicles/engines
  - **USDA / APHIS** — plants, animals, animal products, wood packaging
  - **FCC** — radio-frequency devices (Form 740 / equivalent ACE message)
  - **CPSC** — children's products, regulated consumer goods
  - **FWS** — wildlife / CITES species
  - **DOT / NHTSA** — vehicles, vehicle equipment
  - **DEA** — controlled substances and listed chemicals
- For each agency the matrix specifies: who provides the data, who files it in ACE, who holds the certifications/registrations, response SLA when a PGA hold is issued.
- Broker confirms PGA flags are filed **with the entry**, not as an afterthought — incorrect PGA data is the single most common cause of avoidable cargo holds.

## Suggested SOW language

> **Data Quality.** Broker shall maintain a Harmonized Tariff Schedule classification database for Importer's products, with every active product validated to a 10-digit HTSUS subheading and audited not less than annually. Broker shall conduct and document a post-summary review of each CBP Form 7501 within ten (10) calendar days after release and shall file any required Post-Summary Correction before liquidation. Broker shall facilitate and maintain Importer's direct access to the Automated Commercial Environment portal under Importer's own credentials. Broker shall maintain a written Partner Government Agency matrix identifying each agency applicable to Importer's products and assigning, for each, the party responsible for data, filing, and response to any agency hold.

## How to report findings

Score each of the four items **Present / Partial / Missing**. Pay particular attention to the PGA matrix — a brokerage that handles a product line where FDA Prior Notice or EPA TSCA applies, without a written PGA assignment, is a near-certain source of avoidable holds and is treated as **High** severity.
