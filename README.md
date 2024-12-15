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


## **Sponsors**

### **BAS**

BAS provides the foundational attestation framework for the platform. Below are the key attestations implemented:

#### **1. ClientAttestation**  
- **Description**: Clients attest themselves as verified entities on the platform, serving as a foundational proof of identity.  
  - **Mainnet**: [0x671de200dd06a41bc1637ae3b3ee5f8e914e3b3a9559e2feddb6a869ef64417c](https://bascan.io/schema/0x671de200dd06a41bc1637ae3b3ee5f8e914e3b3a9559e2feddb6a869ef64417c)  
  - **Testnet**: [0x671de200dd06a41bc1637ae3b3ee5f8e914e3b3a9559e2feddb6a869ef64417c](https://testnet.bascan.io/schema/0x671de200dd06a41bc1637ae3b3ee5f8e914e3b3a9559e2feddb6a869ef64417c)  

#### **2. FreelancerAttestation**  
- **Description**: Freelancers attest their presence and credentials on the platform, ensuring verified participation.  
  - **Mainnet**: [0x429ad524f39cc3fcd95c367f0f6d86ea2e5a1966c3facd7903538bb9f2f94888](https://bascan.io/schema/0x429ad524f39cc3fcd95c367f0f6d86ea2e5a1966c3facd7903538bb9f2f94888)  
  - **Testnet**: [0x429ad524f39cc3fcd95c367f0f6d86ea2e5a1966c3facd7903538bb9f2f94888](https://testnet.bascan.io/schema/0x429ad524f39cc3fcd95c367f0f6d86ea2e5a1966c3facd7903538bb9f2f94888)  

#### **3. GigAttestation**  
- **Description**: Created whenever a client posts a gig (job) on the platform. Includes details like job description, deliverables, budget, and deadlines.  
  - **Mainnet**: [0xb3221d0e61e90db95e4a4c1799725caabf8ffdec227897eab359abf3fd6191fe](https://bascan.io/schema/0xb3221d0e61e90db95e4a4c1799725caabf8ffdec227897eab359abf3fd6191fe)  
  - **Testnet**: [0xb3221d0e61e90db95e4a4c1799725caabf8ffdec227897eab359abf3fd6191fe](https://testnet.bascan.io/schema/0xb3221d0e61e90db95e4a4c1799725caabf8ffdec227897eab359abf3fd6191fe)  

#### **4. GigAgreement**  
- **Description**: Generated when a client chooses a freelancer and both parties sign an agreement. Serves as an immutable proof of commitment.  
  - **Mainnet**: [0x09e3e1dc8c19670ccf128c657bfcb707d792921852df48ce837af27e5666322c](https://bascan.io/schema/0x09e3e1dc8c19670ccf128c657bfcb707d792921852df48ce837af27e5666322c)  
  - **Testnet**: [0x09e3e1dc8c19670ccf128c657bfcb707d792921852df48ce837af27e5666322c](https://testnet.bascan.io/schema/0x09e3e1dc8c19670ccf128c657bfcb707d792921852df48ce837af27e5666322c)  

#### **5. EvaluationAttestation**  
- **Description**: Created after the freelancer submits their work. AI evaluates the submission, generating a relevance score and feedback, which is recorded as part of this attestation.  
  - **Mainnet**: [0x784be583b872cdf051ae174d034cd499d3e5f17b35d6640e6cd052068c6b17d2](https://bascan.io/schema/0x784be583b872cdf051ae174d034cd499d3e5f17b35d6640e6cd052068c6b17d2)  
  - **Testnet**: [0x784be583b872cdf051ae174d034cd499d3e5f17b35d6640e6cd052068c6b17d2](https://testnet.bascan.io/schema/0x784be583b872cdf051ae174d034cd499d3e5f17b35d6640e6cd052068c6b17d2)  

#### **6. DisputeAttestation**  
- **Description**: Created whenever a dispute is raised, including the reason for the dispute. Links back to the relevant GigAttestation.  
  - **Mainnet**: [0xfcbd204f6589f50e8b92031c3b256838ad1913dbbdf769b747d1ff23ef4a07f1](https://bascan.io/schema/0xfcbd204f6589f50e8b92031c3b256838ad1913dbbdf769b747d1ff23ef4a07f1)  
  - **Testnet**: [0xfcbd204f6589f50e8b92031c3b256838ad1913dbbdf769b747d1ff23ef4a07f1](https://testnet.bascan.io/schema/0xfcbd204f6589f50e8b92031c3b256838ad1913dbbdf769b747d1ff23ef4a07f1)  

#### **7. VoteOnDisputeAttestation**  
- **Description**: Generated when validators vote on a dispute. Points to the DisputeAttestation and further links to the associated GigAttestation, ensuring transparency in validator decisions.  
  - **Mainnet**: [0x645ac1d4ea9c398ce4e5789f57269a526b925d5f92916f3391f7e1065eede38c](https://bascan.io/schema/0x645ac1d4ea9c398ce4e5789f57269a526b925d5f92916f3391f7e1065eede38c)  
  - **Testnet**: [0x645ac1d4ea9c398ce4e5789f57269a526b925d5f92916f3391f7e1065eede38c](https://testnet.bascan.io/schema/0x645ac1d4ea9c398ce4e5789f57269a526b925d5f92916f3391f7e1065eede38c)  



