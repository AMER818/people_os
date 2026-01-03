# Pitch Deck Visual Assets & Competitive Analysis

## 1. Competitive Positioning Quadrant
The "Enterprise HCM Quadrant" shows where Hunzal People OS stands relative to traditional and modern competitors.

| Attribute | Legacy HCM (SAP/Workday) | Modern SMB (BambooHR/Gusto) | Hunzal People OS |
| :--- | :--- | :--- | :--- |
| **Agility** | Low (Heavy implementation) | High (Plug-and-play) | **Extreme** (Proprietary Analyzer) |
| **Intelligence** | Reactive Reporting | Basic Analytics | **Predictive AI Insights** |
| **Complexity** | Extremely High | Low/Medium | **Enterprise-Grade yet Intuitive** |
| **Cost** | $$$$$ | $$ | **ROI-Focused SaaS** |

```mermaid
quadrantChart
    title Enterprise HCM Market Positioning
    x-axis Low Technical Agility --> High Technical Agility
    y-axis Reactive Data --> Intelligent Predictive AI
    quadrant-1 "Visionary Leaders"
    quadrant-2 "Niche Players"
    quadrant-3 "Legacy Goliaths"
    quadrant-4 "SaaS Generalists"
    "SAP SuccessFactors": [0.2, 0.4]
    "Workday": [0.3, 0.5]
    "BambooHR": [0.8, 0.3]
    "Gusto": [0.9, 0.2]
    "Hunzal People OS": [0.85, 0.9]
```

## 2. Feature Comparison Matrix

| Feature | Legacy Systems | Generic SaaS | Hunzal People OS |
| :--- | :--- :| :--- :| :--- :|
| **Multi-Tenant Org Wiring** | Complex | Basic | ✅ Built-in Enterprise Wiring |
| **Sub-Department Isolation** | Rigid | Missing | ✅ 100% Granular Persistence |
| **Built-in AI Analyzer** | Third-party only | Basic Bots | ✅ Integrated Gemini-Powered Layer |
| **Mobile-First Scroll Isolation** | Poor | Mixed | ✅ 100% CSS-Locked Professional Feel |
| **Zero TS Error Reliability** | N/A | Variable | ✅ Production-Grade Typescript |

## 3. High-Level Flow Diagram: Employee Onboarding
```mermaid
graph LR
    A[Start] --> B(Candidate Creation)
    B --> C{Verified?}
    C -- Yes --> D(Employee Record Conversion)
    C -- No --> B
    D --> E(Assignment to Org Unit)
    E --> F(Payroll Initialization)
    F --> G[Onboarded]
    
    style G fill:#059669,color:#fff
    style A fill:#4f46e5,color:#fff
```
