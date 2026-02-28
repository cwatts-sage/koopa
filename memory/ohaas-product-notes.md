# OHaaS — OpenClaw Hardening as a Service
**URL:** https://www.ohaas.com
**By:** Ask Sage
**Status:** Early beta access

## What It Is
Enterprise-grade OpenClaw deployments hardened for government & defense. Wraps the open-source OpenClaw AI agent framework in a hardened, multi-tenant Kubernetes platform with enterprise security, compliance controls, and operational tooling.

## Tagline
"AI Agent Hosting, Hardened for Government & Enterprise"

## Key Stats
- 0 Critical CVEs
- FIPS 140-3 Validated
- 267+ Pre-installed Packages
- 8 Authentication Modes

## Core Features

### Security
- **FIPS 140-3 Validated** — Chainguard FIPS 140-3 validated base images, cryptographic modules across every container layer, signed images + SBOMs
- **Zero CVE Base** — Continuous vulnerability scanning in CI/CD, blocks High/Critical CVEs, daily automated rebuilds
- **Security Watcher Sidecar** — Real-time process monitoring, network anomaly detection, config drift analysis, filesystem integrity checks, auto-quarantine on critical findings
- **Content Security:**
  - Outbound DLP scanning (PII, credentials, API keys)
  - Inbound prompt injection detection (44 regex patterns + heuristic scoring)
  - Malicious code detection (11 YARA rules for reverse shells, cryptominers, container escapes)

### Infrastructure
- **Multi-Tenant Kubernetes** — Per-tenant isolation, security admission policies, network segmentation, resource quotas, dedicated storage
- **VM-Like Persistence** — System-state PVC mounts /usr, /etc, /lib — pip installs, npm packages survive restarts
- **Identity Portability** — Package entire agent (config, memory, skills, crons, scripts) into encrypted tarball, restore anywhere

### Authentication (8 Modes)
1. DoD CAC/PIV mTLS
2. YubiKey client certificates
3. OIDC/OAuth2 SSO (Azure AD, Google, Okta)
4. IP whitelisting
5. Gateway token
6. Combined CAC+YubiKey
7. Azure Gov sovereign clouds
8. Custom OIDC provider

### Egress Firewall (Per-Tenant)
- Deny-all default
- Predefined rule library (8 categories: AI providers, messaging, email, cloud, gov cloud, etc.)
- Custom URL whitelist with L7 hostname filtering
- Gov Cloud egress rules (AWS GovCloud, Azure Government)

### Admin Dashboard
- Dark-themed ops console with SSO
- Create tenants, monitor health, view watcher findings
- Import/export identities
- Security dashboard with severity filtering, CSV/JSON export for SIEM

## Use Cases
- **Acquisition & Contracting** — Draft RFPs, analyze proposals, track FAR/DFARS compliance
- **Warfighting COA Analysis** — Course of action development, wargaming, operational planning
- **Software Development** — Build features, refactor code, deploy dashboards, automate CI/CD
- **Cyber Operations** — Threat intel summarization, SIEM log analysis, incident response, CVE triage

## Deployment
1. Deploy on any Kubernetes cluster (AKS, EKS, GKE, on-prem)
2. Create tenants via admin dashboard or CLI
3. Monitor & manage from single pane of glass

## Architecture
- nginx Ingress (TLS termination, mTLS, WAF)
- Platform namespace (ohaas-system): Admin UI + OHaaS CLI
- Tenant namespaces (isolated): OpenClaw container + Watcher sidecar + Security Proxy
- Persistent storage: Data PVC, Workspace PVC, System PVC, Backup PVC

## Compliance Targets
- DoD IL4/IL5/IL6
- FedRAMP High
