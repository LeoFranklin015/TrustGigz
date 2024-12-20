// "use client";
// import Homepage from "@/components/pages/Homepage";
// import { Button } from "@/components/ui/button";

// import {
//   BAS,
//   SchemaEncoder,
//   SchemaRegistry,
// } from "@bnb-attestation-service/bas-sdk";
// import { useEthersSigner } from "@/lib/viemClient";

// import { useAccount } from "wagmi";
// import { bscTestnet } from "viem/chains";
// import { useEffect } from "react";
// import { sign } from "crypto";
// import axios from "axios";
// export default function page() {
//   const BASContractAddress = "0x6c2270298b1e6046898a322acB3Cbad6F99f7CBD"; //bnb testnet
//   const bas = new BAS(BASContractAddress);
//   const signer = useEthersSigner({ chainId: bscTestnet.id });
//   const { address } = useAccount();

//   useEffect(() => {
//     if (signer) {
//       bas.connect(signer);
//     }
//   }, [signer, address]);

//   // const getAttestation = async () => {
//   //   const schemaRegistryContractAddress =
//   //     "0x08C8b8417313fF130526862f90cd822B55002D72"; //bnb testnet
//   //   const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);
//   //   schemaRegistry.connect(signer!);

//   //   const schemaUid =
//   //     "0xa04f897fe7ee7715bacd5f2c4fc8f867a81e68b2eaa48cf196ab1e4ae5718704";
//   //   const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUid });

//   //   console.log(schemaRecord.schema);
//   // };

//   const createAttestation = async () => {
//     const schemaEncoder = new SchemaEncoder(
//       "string freelancerName,address freelancerAddress,string freelancerBio,string[] skills,uint256 reputationScore,uint256 noOfGigsCompleted,uint256 noOfDisputesArised,uint256 noOfDisputesWon"
//     );

//     const encodedData = schemaEncoder.encodeData([
//       { name: "freelancerName", value: "Leo", type: "string" },
//       {
//         name: "freelancerAddress",
//         value: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
//         type: "address",
//       },
//       { name: "freelancerBio", value: "test bio", type: "string" },
//       { name: "skills", value: ["test", "test2"], type: "string[]" },
//       { name: "reputationScore", value: BigInt(0), type: "uint256" }, // 1, type: "uint256" },
//       { name: "noOfGigsCompleted", value: BigInt(0), type: "uint256" },
//       { name: "noOfDisputesArised", value: BigInt(0), type: "uint256" },
//       { name: "noOfDisputesWon", value: BigInt(0), type: "uint256" },
//     ]);
//     const schemaUID =
//       "0x429ad524f39cc3fcd95c367f0f6d86ea2e5a1966c3facd7903538bb9f2f94888";
//     bas.connect(signer!);
//     const tx = await bas.attest({
//       schema: schemaUID,
//       data: {
//         recipient: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
//         expirationTime: BigInt(0),
//         revocable: true, // Be aware that if your schema is not revocable, this MUST be false
//         data: encodedData,
//       },
//     });

//     const newAttestationUID = await tx.wait();

//     const dataAddedToDb = await axios.post(
//       "http://localhost:4000/api/freelancer",
//       {
//         uid: newAttestationUID,
//         freelancerName: "Leo",
//         freelancerAddress: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
//         freelancerBio: "test bio",
//         skills: ["test", "test2"],
//       }
//     );

//     console.log("New attestation UID:", newAttestationUID);
//     console.log(dataAddedToDb);
//   };

//   const decodeData = () => {
//     const schemaEncoder = new SchemaEncoder(
//       "string freelancerName,address freelancerAddress,string freelancerBio,string[] skills,uint256 reputationScore,uint256 noOfGigsCompleted,uint256 noOfDisputesArised,uint256 noOfDisputesWon"
//     );
//     const data = schemaEncoder.decodeData(
//       "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAABLSzDi58ZGOwPN/9bEIynTVyBTNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADTGVvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACHRlc3QgYmlvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAR0ZXN0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFdGVzdDIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
//     );
//     console.log(data);
//   };

//   const getAttestation = async () => {
//     bas.connect(signer!);

//     const uid =
//       "0x43170cc08cb9b62bba0d5c0a598a0850e76a42983da308ae15259da3bc9bdeaf";
//     const attestation = await bas.getAttestation(uid);
//     console.log(attestation);
//     const schemaEncoder = new SchemaEncoder(
//       "string freelancerName,address freelancerAddress,string freelancerBio,string[] skills,uint256 reputationScore,uint256 noOfGigsCompleted,uint256 noOfDisputesArised,uint256 noOfDisputesWon"
//     );
//     const data = schemaEncoder.decodeData(attestation.data);
//     console.log(data);
//   };

//   const createClient = async () => {
//     const schemaEncoder = new SchemaEncoder(
//       "string clientName,address clientAddress,string clientBio,string[] category,uint256 reputationScore,uint256 noOfJobsPosted,uint256 noOfDisputesRaised,uint256 noOfDisputesWon"
//     );

//     const encodedData = schemaEncoder.encodeData([
//       { name: "clientName", value: "Leo", type: "string" },
//       {
//         name: "clientAddress",
//         value: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
//         type: "address",
//       },
//       { name: "clientBio", value: "test bio", type: "string" },
//       { name: "category", value: ["test", "test2"], type: "string[]" },
//       { name: "reputationScore", value: BigInt(0), type: "uint256" }, // 1, type: "uint256" },
//       { name: "noOfJobsPosted", value: BigInt(0), type: "uint256" },
//       { name: "noOfDisputesRaised", value: BigInt(0), type: "uint256" },
//       { name: "noOfDisputesWon", value: BigInt(0), type: "uint256" },
//     ]);
//     const schemaUID =
//       "0x671de200dd06a41bc1637ae3b3ee5f8e914e3b3a9559e2feddb6a869ef64417c";
//     bas.connect(signer!);
//     const tx = await bas.attest({
//       schema: schemaUID,
//       data: {
//         recipient: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
//         expirationTime: BigInt(0),
//         revocable: true, // Be aware that if your schema is not revocable, this MUST be false
//         data: encodedData,
//       },
//     });

//     const newAttestationUID = await tx.wait();

//     const dataStoredinDb = await axios.post(
//       "http://localhost:4000/api/client",
//       {
//         uid: newAttestationUID,
//         clientName: "Leo",
//         clientAddress: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
//         clientBio: "test bio",
//         category: ["test", "test2"],
//       }
//     );

//     console.log("New attestation UID:", newAttestationUID);
//     console.log(dataStoredinDb);
//   };

//   return (
//     <div className="justify-center items-center">
//       <div>Testing page</div>
//       <Button onClick={getAttestation}>fetch Attestation</Button>
//       <Button onClick={createAttestation}>create Attestation</Button>
//       <Button onClick={createClient}>create Client</Button>{" "}
//       <Button onClick={decodeData}>decode data</Button>
//     </div>
//   );
// }

import Submission from "@/components/pages/Submission";
import React from "react";

const page = () => {
  return <div>{/* <Submission /> */}</div>;
};

export default page;
