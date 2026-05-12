---
name: customs-broker-operations
description: Use when evaluating a US customs broker for operational speed and communication — dedicated points of contact (in and out of hours), pre-arrival electronic entry filing, and automated real-time tracking of ISF and entry status (CargoWise or equivalent). Triggers include "broker POC", "after-hours coverage", "pre-arrival filing", "ISF tracking", "CargoWise", "entry visibility", "terminal delay", "broker SLA on response time", or any request to spec out the day-to-day operational requirements of a broker engagement.
---

# Operational Speed & Communication Requirements

Most penalty events and demurrage charges trace back to two things: nobody could reach the broker, or the entry was filed late. These three controls remove that risk.

## Checklist

### 1. Dedicated Point of Contact (POC)

- The SOW names a **specific, knowledgeable POC** (with title, email, direct phone) plus at least one backup.
- POC is available **during and outside normal operating hours**, including weekends and US holidays when cargo is moving.
- Maximum response SLA to a CBP inquiry, hold, or exam request: **24 hours**, with a stricter inside-business-hours target (commonly 2–4 hours).
- The POC has authority and knowledge to act — not just route messages. If the POC is a junior coordinator with no licensed-broker access, this is a fail.

**Red flag:** "best efforts" language with no named individual and no after-hours number.

### 2. Pre-Arrival Filing

- Broker commits to **submit entry documentation electronically before merchandise arrives** at the port of entry whenever possible — for ocean, file inside the 5-day ABI/ACE pre-arrival window; for air, before wheels-down; for truck (CBP/Canada-Mexico), before arrival at the border.
- **ISF-10 ("10+2")** is filed **no later than 24 hours before lading** at the foreign port for ocean cargo, with confirmation receipts retained.
- Entry type is pre-selected and PGA flags pre-evaluated so that holds are identified before the cargo grounds — not after.

### 3. Automated Tracking

- The broker provides **real-time visibility** via:
  - An industry platform such as **CargoWise**, Descartes, e2open, or
  - The broker's **proprietary portal**, with at minimum: ISF status, entry status, exam/hold indicators, release status, post-summary status, duty payment status.
- IOR users get named logins (not shared credentials).
- Status changes (hold, exam, request for information) trigger an **automatic alert** (email or webhook) to the named IOR POC — not just a portal update the IOR has to discover.

## Suggested SOW language

> **Operational Coverage.** Broker shall designate a named primary point of contact and at least one named backup, each available to respond to Customs and Border Protection inquiries within twenty-four (24) hours including outside normal business hours. Broker shall file entry documentation electronically prior to the arrival of the merchandise at the port of entry whenever permitted, and shall file Importer Security Filings no later than twenty-four (24) hours prior to lading at the foreign port. Broker shall provide Importer with continuous real-time visibility — through CargoWise or an equivalent platform — into ISF status, entry status, holds, exams, releases, and duty payment status, with automated alerts to Importer on any status change.

## How to report findings

For each of the three items, mark **Present / Partial / Missing**. Missing POC or after-hours coverage is treated as **High** severity even if the rest of the SOW is strong — operational silence at the wrong moment turns a routine hold into demurrage and chargebacks.
