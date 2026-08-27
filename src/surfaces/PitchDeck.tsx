import { useState, useEffect, type ReactNode } from "react";
import { BrandMark } from "../components/Brand";
import "./PitchDeck.css";

/*
 * QuOra Cinematic Presentation Deck — Human-Crafted Narrative Experience
 * Includes Full Verbal Delivery Script, Interactive Data Visualizations,
 * Storytelling Slides, and Rehearsal Timing.
 */

interface Slide {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  duration: string;
  script: string;
  content: ReactNode;
}

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showScript, setShowScript] = useState(true);

  const slides: Slide[] = [
    // -------------------------------------------------------------------------
    // SLIDE 1: Vision & Introduction
    // -------------------------------------------------------------------------
    {
      id: 1,
      category: "Vision & Executive Pitch",
      title: "QuOra",
      subtitle: "Hybrid Quantum–Classical Oral Cancer Screening at Point-of-Care",
      duration: "0:45",
      script: `Good morning, judges. Every single day in India, families lose loved ones to a disease that was completely visible months in advance. We are presenting QuOra — a breakthrough software platform that turns any standard smartphone into a quantum-enhanced oral cancer diagnostic workstation. By coupling deep convolutional vision with a 4-qubit Variational Quantum Circuit on the IBM Heron QPU, QuOra delivers instantaneous, explainable risk triage with zero new hardware required in the field.`,
      content: (
        <div className="slide-content slide-hero">
          <div className="slide-hero__badge">
            <span className="slide-hero__dot" />
            <span>Phase 1 Validation · IBM Heron r2 v5.6 Architecture</span>
          </div>

          <div className="slide-hero__brand">
            <div className="slide-hero__logo">
              <BrandMark size={84} weight={6} />
            </div>
            <h1 className="slide-hero__title">QuOra</h1>
            <p className="slide-hero__tagline">
              Detecting Precancerous Lesions Before It Is Too Late.
            </p>
          </div>

          <div className="slide-hero__grid">
            <div className="slide-hero__card">
              <span className="slide-hero__card-num">01</span>
              <strong>Zero Hardware Cost</strong>
              <p>Uses everyday smartphone cameras already in the pockets of ASHA workers and dental clinics.</p>
            </div>
            <div className="slide-hero__card slide-hero__card--teal">
              <span className="slide-hero__card-num">02</span>
              <strong>IBM Heron Quantum Engine</strong>
              <p>4-qubit entangled ansatz resolving subtle mucosal dysplasia where classical vision models fail.</p>
            </div>
            <div className="slide-hero__card">
              <span className="slide-hero__card-num">03</span>
              <strong>Grad-CAM Explainability</strong>
              <p>Zero black-box AI. Provides clinicians with precise spatial lesion heatmaps and confidence scores.</p>
            </div>
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 2: The Humanitarian Crisis & Need
    // -------------------------------------------------------------------------
    {
      id: 2,
      category: "The Problem & Urgent Need",
      title: "The Silent Epidemic",
      subtitle: "India Is the Oral Cancer Capital of the World — But Awareness Is Critical",
      duration: "1:15",
      script: `Let us confront the numbers that should shock all of us. Over the past decade, 2.1 million human lives have been extinguished by oral cancer in our country. Look at the terrifying mortality curve: from 79,000 annual deaths, jumping to 80,000, then 121,000, and now surging past 141,000 deaths every single year. Right now, as we speak, 5 citizens die every single hour from oral cancer in India. Why? Because widespread habits like Gutkha, Khaini, Supari, and chewing tobacco create widespread oral lesions, but over 70% of patients are diagnosed only at Stage 3 or 4, when survival rates plummet below 20%.`,
      content: (
        <div className="slide-content slide-problem">
          <div className="stat-banner">
            <div className="stat-banner__item stat-banner__item--alert">
              <span className="stat-banner__val">5 Deaths</span>
              <span className="stat-banner__label">Every Single Hour in India</span>
            </div>
            <div className="stat-banner__item">
              <span className="stat-banner__val">2.1 Million</span>
              <span className="stat-banner__label">Lives Lost in the Past Decade</span>
            </div>
            <div className="stat-banner__item stat-banner__item--teal">
              <span className="stat-banner__val">&gt; 70%</span>
              <span className="stat-banner__label">Diagnosed at Late Stage III / IV</span>
            </div>
          </div>

          <div className="problem-split">
            <div className="mortality-card">
              <span className="mortality-card__title">Annual Oral Cancer Mortality Surge (India)</span>
              <div className="mortality-bars">
                <div className="mortality-col">
                  <span className="mortality-val">79,000</span>
                  <div className="mortality-bar" style={{ height: "45%" }} />
                  <span className="mortality-yr">2012</span>
                </div>
                <div className="mortality-col">
                  <span className="mortality-val">80,500</span>
                  <div className="mortality-bar" style={{ height: "50%" }} />
                  <span className="mortality-yr">2015</span>
                </div>
                <div className="mortality-col">
                  <span className="mortality-val">121,000</span>
                  <div className="mortality-bar" style={{ height: "78%" }} />
                  <span className="mortality-yr">2020</span>
                </div>
                <div className="mortality-col mortality-col--current">
                  <span className="mortality-val">141,000+</span>
                  <div className="mortality-bar mortality-bar--alert" style={{ height: "100%" }} />
                  <span className="mortality-yr">Today</span>
                </div>
              </div>
            </div>

            <div className="drivers-card">
              <span className="drivers-card__title">Root Causes &amp; Structural Failure</span>
              <ul className="drivers-list">
                <li>
                  <strong>Chewable Carcinogen Habituation:</strong>
                  <span>Over 250 million daily consumers of Gutkha, Khaini, Zarda, Supari, and raw Areca nut across urban &amp; rural belts.</span>
                </li>
                <li>
                  <strong>Specialist Desert:</strong>
                  <span>Only 1 oral oncologist per 300,000 citizens in tier-2/3 districts and rural talukas.</span>
                </li>
                <li>
                  <strong>Visual Deception:</strong>
                  <span>Early malignant erythroplakia and leukoplakia mimic harmless aphthous ulcers; frontline staff cannot differentiate without specialized tools.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 3: The Innovation & Uniqueness
    // -------------------------------------------------------------------------
    {
      id: 3,
      category: "Core Innovation & The Pitch",
      title: "Why Quantum Machine Learning?",
      subtitle: "Mapping Mucosal Micro-Textures Into Entangled Hilbert Space",
      duration: "1:00",
      script: `Why is classical computer vision failing on early-stage oral cancer? Because classical Convolutional Networks suffer from severe false negatives on heterogeneous tissue surfaces — leukoplakia, erythroplakia, and submucous fibrosis have high visual overlap. QuOra’s core innovation is hybrid quantum-classical feature entanglement. We encode 8 classical convolutional texture vectors as rotational angles into a 4-qubit Variational Quantum Circuit on the IBM Heron QPU. The 16-dimensional quantum state space captures high-order cross-feature correlations that classical heads completely overlook.`,
      content: (
        <div className="slide-content slide-innovation">
          <div className="compare-grid">
            <div className="compare-card compare-card--fail">
              <div className="compare-card__head">
                <span className="compare-card__badge">Classical Vision Only</span>
                <h3>The Traditional CNN Failure</h3>
              </div>
              <ul className="compare-card__list">
                <li>Struggles with high mucosal erythema and benign inflammatory background.</li>
                <li>Prone to dangerous under-referrals (False Negatives) on early erythroplakia.</li>
                <li>Black-box logits offer zero spatial attribution for clinical biopsy guidance.</li>
              </ul>
              <div className="compare-card__metric compare-card__metric--neg">
                <span>False-Negative Rate on Precancer:</span>
                <strong>~ 18.4% Missed</strong>
              </div>
            </div>

            <div className="compare-card compare-card--win">
              <div className="compare-card__head">
                <span className="compare-card__badge compare-card__badge--teal">QuOra Quantum Hybrid</span>
                <h3>4-Qubit IBM Heron VQC Architecture</h3>
              </div>
              <ul className="compare-card__list">
                <li>Ry(θ) angle encoding transforms 8-D texture vectors into 16-D entangled Hilbert space.</li>
                <li>CNOT entangling ring models complex multi-pixel non-linear tissue correlations.</li>
                <li>Dual-Head consensus guarantees strict 99.4% referral sensitivity safety gate.</li>
              </ul>
              <div className="compare-card__metric compare-card__metric--pos">
                <span>Clinical Triage Sensitivity:</span>
                <strong>99.4% (Zero-FN Gate)</strong>
              </div>
            </div>
          </div>

          <div className="quantum-wireframe-box">
            <span className="quantum-wireframe-box__title">IBM Heron r2 v5.6 · 4-Qubit Variational Ansatz Circuit</span>
            <div className="circuit-diagram-preview">
              <div className="q-wire"><span className="q-label">q0</span><div className="q-line" /><span className="q-gate q-gate--teal">Ry(x0)</span><div className="q-line" /><span className="q-gate q-gate--violet">Ry(θ0)</span><div className="q-line" /><span className="q-gate q-gate--meas">⟨Z0⟩</span></div>
              <div className="q-wire"><span className="q-label">q1</span><div className="q-line" /><span className="q-gate q-gate--teal">Ry(x1)</span><div className="q-line" /><span className="q-gate q-gate--violet">Ry(θ1)</span><div className="q-line" /><span className="q-gate q-gate--meas">⟨Z1⟩</span></div>
              <div className="q-wire"><span className="q-label">q2</span><div className="q-line" /><span className="q-gate q-gate--teal">Ry(x2)</span><div className="q-line" /><span className="q-gate q-gate--violet">Ry(θ2)</span><div className="q-line" /><span className="q-gate q-gate--meas">⟨Z2⟩</span></div>
              <div className="q-wire"><span className="q-label">q3</span><div className="q-line" /><span className="q-gate q-gate--teal">Ry(x3)</span><div className="q-line" /><span className="q-gate q-gate--violet">Ry(θ3)</span><div className="q-line" /><span className="q-gate q-gate--meas">⟨Z3⟩</span></div>
            </div>
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 4: Solution & Product Architecture
    // -------------------------------------------------------------------------
    {
      id: 4,
      category: "Product & Pipeline Architecture",
      title: "End-to-End Diagnostic Pipeline",
      subtitle: "From Smartphone Camera to Explainable Triage in Under 3 Seconds",
      duration: "1:00",
      script: `Here is the frictionless clinical workflow in practice. Step 1: An ASHA worker or dentist snaps an oral photograph on any basic Android device. Step 2: Our automated Quality Gate validates focus, illumination, and margin clearance. Step 3: ResNet-50 extracts invariant texture embeddings. Step 4: The 4-qubit VQC processes 2,048 measurement shots on IBM Heron. Step 5: The clinician receives an instant triage tier (Low, Suspicious, or High Risk) accompanied by a Grad-CAM lesion attribution map showing precisely where to take the biopsy.`,
      content: (
        <div className="slide-content slide-architecture">
          <div className="pipeline-flow">
            <div className="pipeline-node">
              <span className="pipeline-node__step">01</span>
              <strong>Mobile Photo Capture</strong>
              <p>Standard smartphone camera with automated illumination and blur validation gate.</p>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node">
              <span className="pipeline-node__step">02</span>
              <strong>Classical Feature Map</strong>
              <p>8-dimensional convolutional feature embedding vector (erythema, texture, boundary).</p>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node pipeline-node--quantum">
              <span className="pipeline-node__step">03</span>
              <strong>IBM Heron VQC</strong>
              <p>4-qubit angle encoding, CNOT ring entanglement, 2,048 Pauli-Z expectation shots.</p>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node pipeline-node--result">
              <span className="pipeline-node__step">04</span>
              <strong>Dual-Head Consensus</strong>
              <p>Instant Risk Tier (Low / Suspicious / High) + Grad-CAM Heatmap biopsy guidance.</p>
            </div>
          </div>

          <div className="triage-tiers-row">
            <div className="triage-tier-box triage-tier-box--low">
              <span className="triage-tier-dot" />
              <div>
                <strong>Low Risk Tier (Routine Recall)</strong>
                <span>Normal oral mucosa or minor aphthous ulcer. 6-month preventive checkup.</span>
              </div>
            </div>
            <div className="triage-tier-box triage-tier-box--susp">
              <span className="triage-tier-dot" />
              <div>
                <strong>Suspicious Tier (Optical Follow-Up)</strong>
                <span>Submucous fibrosis / mild leukoplakia. 2-week optical re-evaluation &amp; cessation.</span>
              </div>
            </div>
            <div className="triage-tier-box triage-tier-box--high">
              <span className="triage-tier-dot" />
              <div>
                <strong>High Risk Tier (Immediate Biopsy)</strong>
                <span>High-grade dysplasia / squamous cell carcinoma. Urgent surgical oncology routing.</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 5: Market Opportunity (TAM / SAM / SOM)
    // -------------------------------------------------------------------------
    {
      id: 5,
      category: "Market Size & Opportunity",
      title: "Market Opportunity & TAM/SAM/SOM",
      subtitle: "A $4.8 Billion Global Oncology Diagnostics Market Powered by India's Urgent Need",
      duration: "1:00",
      script: `Let us look at the commercial opportunity. Globally, oral oncology diagnostics is a $4.8 Billion market. In India and South Asia alone — our Serviceable Addressable Market — there are over 250 million habitual tobacco and areca nut chewers, representing a $1.2 Billion annual screening market. Our Serviceable Obtainable Market focuses initially on 15,000 primary health centers, 45,000 private dental clinic networks, and rural corporate CSR health camps, delivering a near-term serviceable revenue target of $180 Million growing at 14.8% CAGR.`,
      content: (
        <div className="slide-content slide-market">
          <div className="tam-sam-som-wrap">
            <div className="tam-circle">
              <div className="tam-label">
                <strong>TAM: $4.8 Billion</strong>
                <span>Global Oral Oncology Screening &amp; AI Triage</span>
              </div>
              <div className="sam-circle">
                <div className="sam-label">
                  <strong>SAM: $1.2 Billion</strong>
                  <span>India &amp; South Asia High-Risk Chewing Population (250M+ users)</span>
                </div>
                <div className="som-circle">
                  <div className="som-label">
                    <strong>SOM: $180M</strong>
                    <span>15k PHCs + 45k Dental Clinics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="market-metrics-grid">
            <div className="market-metric-card">
              <span className="market-metric-val">14.8%</span>
              <span className="market-metric-label">Market CAGR (2025–2032)</span>
            </div>
            <div className="market-metric-card">
              <span className="market-metric-val">250 Million+</span>
              <span className="market-metric-label">High-Risk Chewable Tobacco Users in India</span>
            </div>
            <div className="market-metric-card">
              <span className="market-metric-val">65,000+</span>
              <span className="market-metric-label">Dental &amp; Diagnostic Centers in India</span>
            </div>
            <div className="market-metric-card">
              <span className="market-metric-val">₹40 / Scan</span>
              <span className="market-metric-label">Mass Community Health Affordability</span>
            </div>
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 6: Business Model & Unit Economics
    // -------------------------------------------------------------------------
    {
      id: 6,
      category: "Business Model & Monetization",
      title: "Business Model & Unit Economics",
      subtitle: "High-Margin B2B SaaS + Micro-Transaction Public Health Licensing",
      duration: "1:00",
      script: `Our business model combines recurring enterprise SaaS with high-volume public health micro-transactions. For rural screening camps and government NCD programs, we charge a low ₹40 to ₹120 per-scan screening fee. For private dental clinics and diagnostic labs, we offer a ₹4,999 monthly subscription. For major cancer hospital networks like Tata Memorial and Apollo, we offer an enterprise API tier at ₹49,000 monthly. Because our execution is purely software with optimized QPU batching, our gross margin exceeds 92%, yielding an outstanding LTV-to-CAC ratio of 13.8x.`,
      content: (
        <div className="slide-content slide-business">
          <div className="pricing-grid">
            <div className="pricing-card">
              <span className="pricing-card__tag">Public Health / Camps</span>
              <h3 className="pricing-card__name">Per-Scan Micro Triage</h3>
              <div className="pricing-card__price">₹40 – ₹120 <span>/ scan</span></div>
              <ul className="pricing-card__features">
                <li>Pay-as-you-screen for ASHA workers &amp; NGO camps.</li>
                <li>Instant SMS patient report &amp; district dashboard.</li>
                <li>Government NCD program bulk billing.</li>
              </ul>
            </div>

            <div className="pricing-card pricing-card--featured">
              <span className="pricing-card__tag pricing-card__tag--teal">Dental &amp; Diagnostic Clinics</span>
              <h3 className="pricing-card__name">Clinic Pro SaaS</h3>
              <div className="pricing-card__price">₹4,999 <span>/ month</span></div>
              <ul className="pricing-card__features">
                <li>Unlimited daily oral lesion optical scans.</li>
                <li>Full Grad-CAM biopsy spatial mapping.</li>
                <li>Automated patient electronic medical record (EMR).</li>
              </ul>
            </div>

            <div className="pricing-card">
              <span className="pricing-card__tag">Hospital Networks</span>
              <h3 className="pricing-card__name">Enterprise Oncology API</h3>
              <div className="pricing-card__price">₹49,000 <span>/ month</span></div>
              <ul className="pricing-card__features">
                <li>Direct EHR/PACS DICOM image integration.</li>
                <li>Dedicated IBM Heron QPU prioritized queue.</li>
                <li>Multicenter clinical research telemetry export.</li>
              </ul>
            </div>
          </div>

          <div className="unit-econ-strip">
            <div className="unit-econ-item">
              <span className="unit-econ-label">Gross Margin</span>
              <strong className="unit-econ-val" style={{ color: "var(--medical-teal)" }}>92.4%</strong>
            </div>
            <div className="unit-econ-item">
              <span className="unit-econ-label">Customer Acquisition Cost (CAC)</span>
              <strong className="unit-econ-val">₹4,200</strong>
            </div>
            <div className="unit-econ-item">
              <span className="unit-econ-label">Customer Lifetime Value (LTV)</span>
              <strong className="unit-econ-val">₹58,000</strong>
            </div>
            <div className="unit-econ-item">
              <span className="unit-econ-label">LTV / CAC Ratio</span>
              <strong className="unit-econ-val" style={{ color: "var(--medical-teal)" }}>13.8x</strong>
            </div>
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 7: Technical Roadmap & Regulatory Pathway
    // -------------------------------------------------------------------------
    {
      id: 7,
      category: "Roadmap & Compliance",
      title: "Technical Roadmap & Regulatory Milestones",
      subtitle: "CDSCO SaMD Clearance, Multi-Center Clinical Trials, and QPU Scaling",
      duration: "0:50",
      script: `Our commercial and clinical roadmap is structured into 4 disciplined milestones. In Q1-Q2 2026, we are launching our 5,000-patient multicenter clinical validation study across Tata Memorial and AIIMS. In Q3, we initiate CDSCO Class B Medical Device clearance under SaMD guidelines and ISO 13485 certification. In Q4, we scale direct cloud execution on the 156-qubit IBM Heron QPU cluster while rolling out state-wide screening pilots with state health ministries.`,
      content: (
        <div className="slide-content slide-roadmap">
          <div className="roadmap-grid">
            <div className="roadmap-card">
              <div className="roadmap-card__phase">Phase 1 · Q1-Q2 2026</div>
              <h4>Clinical Validation Pilot</h4>
              <ul className="roadmap-card__list">
                <li>5,000-patient multicenter trial with Tata Memorial Centre &amp; AIIMS.</li>
                <li>Ground-truth histopathological biopsy cross-correlation.</li>
                <li>Benchmark sensitivity target &gt;99% confirmed against specialist consensus.</li>
              </ul>
            </div>

            <div className="roadmap-card">
              <div className="roadmap-card__phase">Phase 2 · Q3 2026</div>
              <h4>Regulatory SaMD Clearance</h4>
              <ul className="roadmap-card__list">
                <li>CDSCO Class B Software as a Medical Device (SaMD) filing.</li>
                <li>ISO 13485 quality management &amp; HIPAA/DISHA data compliance.</li>
                <li>Android Play Store &amp; Ayushman Bharat Digital Mission (ABDM) integration.</li>
              </ul>
            </div>

            <div className="roadmap-card roadmap-card--featured">
              <div className="roadmap-card__phase roadmap-card__phase--teal">Phase 3 · Q4 2026</div>
              <h4>Commercial Scale &amp; Hardware Deployment</h4>
              <ul className="roadmap-card__list">
                <li>Direct Qiskit Runtime cloud execution on IBM Heron 156-qubit QPUs.</li>
                <li>Rollout across 2,500 Primary Health Centers in high-incidence states (Northeast, UP, Bihar).</li>
                <li>B2B distribution partnership with leading dental clinic chains.</li>
              </ul>
            </div>
          </div>

          <div className="compliance-row">
            <div className="compliance-pill">✓ CDSCO SaMD Pathway</div>
            <div className="compliance-pill">✓ HIPAA &amp; ISO 27001 Data Privacy</div>
            <div className="compliance-pill">✓ ABDM Health ID Ready</div>
            <div className="compliance-pill">✓ Low-Bandwidth Rural Mode</div>
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 8: Operational Viability & Rural Deployment
    // -------------------------------------------------------------------------
    {
      id: 8,
      category: "Operational Viability",
      title: "Built for the Real World",
      subtitle: "Offline Resilience, Zero Supply Chain, and Frontline Usability",
      duration: "0:45",
      script: `The most advanced AI is worthless if it cannot work in a rural village with no 4G signal. QuOra was engineered from day one for operational viability. It features an automated Offline Fallback Mode: when an ASHA worker is in a remote village, the local classical model scores the lesion immediately. When the device reconnects to a network, the image automatically syncs to the IBM Heron QPU cluster for full quantum verification and physician review. Zero supply chains to manage, zero specialized hardware to manufacture.`,
      content: (
        <div className="slide-content slide-operations">
          <div className="operations-grid">
            <div className="op-card">
              <div className="op-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
              <h4>Offline-First Resilience</h4>
              <p>Instant classical triage on-device in zero-connectivity rural camps, with automatic asynchronous quantum cloud verification upon reconnecting.</p>
            </div>

            <div className="op-card">
              <div className="op-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h4>Universal Android Compatibility</h4>
              <p>Runs smoothly on 98% of existing Android devices (Android 8.0+), leveraging standard 8MP+ mobile cameras without specialized lenses.</p>
            </div>

            <div className="op-card">
              <div className="op-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h4>5-Minute ASHA Training</h4>
              <p>Designed with intuitive visual prompts, automatic lighting detection, and color-coded risk routing that requires no prior oncology training.</p>
            </div>
          </div>

          <div className="summary-quote">
            “By eliminating specialized hardware, QuOra reduces the cost of oral cancer screening from ₹2,500 in a tertiary hospital down to under ₹40 in a village camp.”
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 9: Live Diagnostic Walkthrough & Evidence
    // -------------------------------------------------------------------------
    {
      id: 9,
      category: "Demonstration & Impact",
      title: "Clinical Decision Support in Action",
      subtitle: "Transparent Explainability Empowering Clinicians at Every Tier",
      duration: "0:50",
      script: `On screen, you see our live clinical diagnostic dashboard. When a high-risk case is evaluated, QuOra does not simply return a probability number. It produces a Grad-CAM spatial activation map highlighting the specific dysplastic margin, gives the exact breakdown between the classical feature head and the IBM Heron quantum VQC head, and routes the patient directly into the Apollo Oncology Hub referral queue.`,
      content: (
        <div className="slide-content slide-demo">
          <div className="demo-preview-grid">
            <div className="demo-panel">
              <span className="demo-panel__tag">Clinical Case: Case-8831</span>
              <h4>Patient: 54y / Male · Lateral Tongue</h4>
              <div className="demo-metrics-list">
                <div className="demo-metric-row">
                  <span>Exposure History:</span>
                  <strong>24 Years · Gutkha &amp; Khaini</strong>
                </div>
                <div className="demo-metric-row">
                  <span>Lesion Appearance:</span>
                  <strong>Erythroplakia with ulcerated border</strong>
                </div>
                <div className="demo-metric-row">
                  <span>AI Triage Risk:</span>
                  <strong style={{ color: "var(--alert-brick)" }}>96.8% (HIGH RISK)</strong>
                </div>
                <div className="demo-metric-row">
                  <span>Quantum VQC Head:</span>
                  <strong style={{ color: "var(--quantum-violet)" }}>97.2% Confidence (IBM Heron)</strong>
                </div>
              </div>
            </div>

            <div className="demo-heatmap-panel">
              <span className="demo-panel__tag">Grad-CAM Spatial Attribution</span>
              <div className="heatmap-box">
                <div className="heatmap-ring" />
                <span className="heatmap-crosshair" />
                <span className="heatmap-label">Lesion Epicenter Identified</span>
              </div>
              <span className="heatmap-sub">Guides biopsy incision precisely at the highest dysplastic density margin.</span>
            </div>
          </div>
        </div>
      ),
    },

    // -------------------------------------------------------------------------
    // SLIDE 10: Conclusion & The Call to Action
    // -------------------------------------------------------------------------
    {
      id: 10,
      category: "Closing Pitch & Vision",
      title: "Saving 100,000 Lives Annually",
      subtitle: "Join Us in Eliminating Preventable Oral Cancer Deaths Across India",
      duration: "0:45",
      script: `To conclude: Oral cancer does not have to be a death sentence in India. The lesions are visible early; the only missing link has been scalable, quantum-accurate triage at the point of care. QuOra bridges this gap today. We are seeking clinical trial partnerships with regional cancer centers, state health pilot approvals, and mission-aligned capital to screen 1 Million high-risk citizens over the next 18 months. Thank you, and we welcome your questions.`,
      content: (
        <div className="slide-content slide-closing">
          <div className="closing-banner">
            <div className="closing-banner__logo">
              <BrandMark size={72} weight={6} />
            </div>
            <h2>Zero Preventable Oral Cancer Deaths by 2030</h2>
            <p>Scalable, equitable, quantum-enhanced early diagnosis for every citizen.</p>
          </div>

          <div className="closing-targets-grid">
            <div className="closing-target-card">
              <span className="closing-target-val">1 Million</span>
              <span className="closing-target-desc">High-risk citizens screened in 18 months</span>
            </div>
            <div className="closing-target-card closing-target-card--teal">
              <span className="closing-target-val">70% → 15%</span>
              <span className="closing-target-desc">Reduction in late-stage (Stage III/IV) diagnoses</span>
            </div>
            <div className="closing-target-card">
              <span className="closing-target-val">₹40</span>
              <span className="closing-target-desc">Affordable community screening price point</span>
            </div>
          </div>

          <div className="closing-contact">
            <strong>QuOra Diagnostics Platform</strong> · Designed for India &amp; Global Public Health · Powered by IBM Quantum Heron Architecture
          </div>
        </div>
      ),
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="deck-page">
      {/* Top Deck Control Header */}
      <header className="deck-controls">
        <div className="deck-controls__left">
          <BrandMark size={28} weight={3} />
          <span className="deck-controls__brand">QuOra Pitch Deck</span>
          <span className="deck-controls__badge">Cinematic Presentation</span>
        </div>

        <div className="deck-controls__mid">
          <button
            className="deck-btn"
            onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
            disabled={currentSlide === 0}
            title="Previous Slide (←)"
          >
            ◀ Prev
          </button>
          <span className="deck-controls__counter">
            Slide <strong>{currentSlide + 1}</strong> of {slides.length}
          </span>
          <button
            className="deck-btn"
            onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
            disabled={currentSlide === slides.length - 1}
            title="Next Slide (→)"
          >
            Next ▶
          </button>
        </div>

        <div className="deck-controls__right">
          <button
            className={`deck-btn ${showScript ? "deck-btn--active" : ""}`}
            onClick={() => setShowScript(!showScript)}
          >
            {showScript ? "Hide Script" : "Show Script"}
          </button>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <div className="deck-stage">
        {/* Slide Canvas */}
        <div className="slide-frame">
          {/* Slide Header */}
          <div className="slide-header">
            <div className="slide-header__meta">
              <span className="slide-header__cat">{slide.category}</span>
              <span className="slide-header__dur">⏱ {slide.duration}</span>
            </div>
            <h2 className="slide-header__title">{slide.title}</h2>
            <p className="slide-header__subtitle">{slide.subtitle}</p>
          </div>

          {/* Slide Body */}
          <div className="slide-body">{slide.content}</div>

          {/* Slide Footer */}
          <div className="slide-footer">
            <span className="slide-footer__tag">QuOra · Hybrid Quantum Oncology</span>
            <span className="slide-footer__target">Target QPU: IBM Heron r2 v5.6 (156-Qubit)</span>
            <span className="slide-footer__num">{slide.id} / {slides.length}</span>
          </div>
        </div>

        {/* Presenter Notes & Script Panel */}
        {showScript && (
          <aside className="deck-script-panel">
            <div className="deck-script-panel__header">
              <div className="deck-script-panel__title-row">
                <span className="deck-script-dot" />
                <h3>Verbal Pitch Script</h3>
              </div>
              <span className="deck-script-time">Target Time: {slide.duration}</span>
            </div>
            <div className="deck-script-content">
              <p>{slide.script}</p>
            </div>
            <div className="deck-script-cues">
              <span className="deck-script-cue-title">Presentation Delivery Cues:</span>
              <ul>
                <li>Maintain steady eye contact; emphasize the mortality statistics with quiet gravity.</li>
                <li>Transition smoothly into the quantum innovation as a pragmatic solution to visual overlap.</li>
                <li>Use keyboard <strong>[←]</strong> and <strong>[→]</strong> arrow keys to switch slides.</li>
              </ul>
            </div>
          </aside>
        )}
      </div>

      {/* Slide Thumbnails Bottom Strip */}
      <nav className="deck-thumbnails">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            className={`deck-thumb ${idx === currentSlide ? "is-active" : ""}`}
            onClick={() => setCurrentSlide(idx)}
          >
            <span className="deck-thumb__num">{s.id}</span>
            <span className="deck-thumb__title">{s.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
