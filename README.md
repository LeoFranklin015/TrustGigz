# **TrustGigz: Bridging Trust in Freelancing**

## **Table of Contents**
1. [Introduction](#introduction)  
2. [Mainnet and Testnet Domains](#mainnet-and-testnet-domains)  
3. [Problem](#problem)  
4. [Solution](#solution)  
5. [Architecture](#architecture)  
6. [Sponsors](#sponsors)  
   - [BAS](#bas)  
   - [ZKPass](#zkpass)  
   - [SpaceID](#spaceid)  

---

## **Introduction**
TrustGigz is a decentralized platform designed to solve the persistent trust issues between freelancers and clients in the freelancing ecosystem. By leveraging blockchain technology, attestations, and AI-powered evaluations, TrustGigz ensures transparency, fairness, and security in freelance collaborations.

---

## **Mainnet and Testnet Domains**
- **Mainnet Domain**: [trustgigz-mainnet.vercel.app](https://trustgigz-mainnet.vercel.app)  
- **Testnet Domain**: [trustgigz.vercel.app](https://trustgigz.vercel.app)

---

## **Problem**
Freelancing platforms today face significant trust deficits:
1. **Mismatched Expectations**: Clients and freelancers often disagree on whether the delivered work meets the job description (JD).
2. **Dispute Escalations**: Without transparent and impartial dispute resolution systems, conflicts frequently arise.
3. **Payment Risks**: Freelancers may not receive payments for completed work, and clients risk paying for subpar deliverables.
4. **Validator Credibility**: Many platforms lack mechanisms to verify the expertise and professionalism of arbitrators resolving disputes.

These issues reduce user confidence and hinder the growth of freelancing platforms.

---

## **Solution**
TrustGigz addresses these challenges through a structured and decentralized approach:

1. **Attestation-Based Agreements**:
   - When a freelancer applies and is selected for a job, an **attestation** is created on the blockchain using tools like BAS.
   - This attestation immutably records the agreed job description, deliverables, and payment terms.

2. **AI-Powered Work Validation**:
   - Freelancers submit their work with a demo video.
   - The submission is analyzed by an **AI agent** to generate a **relevance score**, objectively comparing it to the JD.

3. **Decentralized Dispute Resolution**:
   - In case of disputes, verified **validators**—subject matter experts who prove their credentials (e.g., Fiverr transaction history)—analyze the context and submission.
   - The dispute outcome is determined by a **weighted average** of validator votes and the AI relevance score.

4. **Escrow-Based Payments**:
   - Clients stake the agreed payment in an escrow contract when creating a job.
   - Funds are released to freelancers only after successful completion or dispute resolution

---

## **Architecture** 

<img width="1221" alt="Screenshot 2024-12-14 at 7 24 08 PM" src="https://github.com/user-attachments/assets/0f80e8a9-3727-43fb-a7e1-400a1bd740e5" />



