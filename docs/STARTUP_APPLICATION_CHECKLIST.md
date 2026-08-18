# Sarvam Startup Program — Application Checklist

## Phase 1: Pre-Application (Week 1–2)

### ✅ Technical (Already Done via This Migration)
- [x] Migrate backend to Sarvam Chat (sarvam-30b)
- [x] Migrate TTS to Sarvam Bulbul v3
- [x] Add Translation (Mayura) support
- [x] Add Document Intelligence support
- [x] Create test endpoints at `/api/sarvam-test/*`
- [x] Test report endpoint at `/api/sarvam-test/test-report`

### 🏢 Legal & Business
- [ ] Register company (Private Ltd / LLP) — approx. ₹15,000–25,000
- [ ] Open current bank account
- [ ] Create company logo and branding
- [ ] Secure domain (e.g., eduvoice.ai)

### 🛍️ Product
- [ ] Deploy to production (Vercel)
- [ ] Create landing page with waitlist form
- [ ] Record 2–3 min demo video (Loom or YouTube)
- [ ] Add `SARVAM_API_KEY` to Vercel environment variables

### 📊 Traction
- [ ] Onboard 10–20 beta teachers
- [ ] Generate 100+ audio files
- [ ] Collect 3–5 teacher testimonials
- [ ] Get 50+ waitlist signups
- [ ] Post demo on LinkedIn (tag #EdTech #AI #IndiaAI #SarvamAI)

---

## Phase 2: Application (Week 3)

### Required Information
- [ ] Company name & website URL
- [ ] Founder details (LinkedIn profile)
- [ ] Problem statement (1 paragraph)
- [ ] Solution description (1 paragraph)
- [ ] Development stage: Pre-seed / MVP
- [ ] Team size & location
- [ ] Intended monthly API usage projection
- [ ] Industry: EdTech / Voice AI

### Supporting Materials
- [ ] Demo video link (2–3 min)
- [ ] Product screenshots
- [ ] Teacher testimonials
- [ ] GitHub repo link
- [ ] Test report output (100% pass rate)

### Submit
- [ ] Fill form at <https://www.sarvam.ai/startup-program>
- [ ] Attach pitch deck
- [ ] Submit application

---

## Phase 3: Post-Application (Week 4–8)

- [ ] Follow up via email after 2 weeks: startups@sarvam.ai
- [ ] Continue building traction
- [ ] Post weekly updates on LinkedIn

### If Selected
- [ ] Sign agreement
- [ ] Get API credits allocated
- [ ] Schedule onboarding call
- [ ] Plan launch announcement

### If Not Selected
- [ ] Request feedback
- [ ] Improve traction metrics
- [ ] Re-apply in 2–3 months
- [ ] Apply to parallel programs:
  - IndiaAI Mission
  - NASSCOM DeepTech Club
  - T-Hub EdTech Accelerator
  - Google for Startups India

---

## API Usage Projection (for Application Form)

| Month | Teachers | Audio Files | Chat Calls | TTS Chars | Translation Chars | Est. Cost (₹) |
|-------|----------|-------------|------------|-----------|-------------------|---------------|
| 1–3 | 20 | 500 | 10,000 | 500K | 50K | ₹2,000 |
| 4–6 | 100 | 2,500 | 50,000 | 2.5M | 250K | ₹10,000 |
| 7–12 | 500 | 12,500 | 250,000 | 12.5M | 1.25M | ₹50,000 |

> **With Startup Program:** ₹0 for 6–12 months 🎉

---

## Generate Your Test Report

Run this before applying — aim for 5/5 pass rate:

```bash
curl http://localhost:8000/api/sarvam-test/test-report
```

Expected output:
```json
{
  "test_report": "EduVoice AI — Sarvam API Integration",
  "total_tests": 5,
  "passed": 5,
  "success_rate": "100.0%",
  "ready_for_production": true,
  "startup_program_ready": true
}
```

---

## Pitch Deck Outline (9 Slides)

1. **Title** — EduVoice AI, founder, institution
2. **Problem** — Teacher workload; 9.5M teachers in India
3. **Solution** — AI voice content creator powered by Sarvam AI
4. **Market** — 260M students, $300B EdTech
5. **Technology** — Sarvam Chat + TTS + Translation stack
6. **Traction** — Beta teachers, audio files, testimonials
7. **Competition** — Voice-first, India-first differentiator
8. **Ask** — 12 months API credits + engineering support
9. **Thank You** — Contact info, live demo link

---

## Key Contacts

| Role | Email |
|------|-------|
| Startup Program | startups@sarvam.ai |
| Support | support@sarvam.ai |
| Documentation | <https://docs.sarvam.ai> |
