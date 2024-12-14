"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Tag,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/ui/navbar";
import { useAccount } from "wagmi";
import axios from "axios";
import { publicClient, useEthersSigner, walletClient } from "@/lib/viemClient";
import { GigContractABI } from "@/lib/abis/GigContract";
import { BAS, SchemaEncoder } from "@bnb-attestation-service/bas-sdk";
import {
  gigAgreement,
  gigAgreementUID,
  gigDisputeSchema,
  gigDisputeSchemaUID,
} from "@/lib/const";
import { bscTestnet } from "viem/chains";
import Submission from "@/components/pages/Submission";
import { VideoPlayer } from "@/components/ui/videoPlayer";
import { PinataSDK } from "pinata-web3";
import Link from "next/link";
import { createWeb3Name } from "@web3-name-sdk/core";
import { resolveAddressToName } from "@/lib/spaceID/fetchWeb3Name";
import {
  StepperModal,
  StepStatus,
  updateStepStatus,
} from "@/components/modals/Stepper";

const GigPage = ({ params }: { params: { uid: string } }) => {
  const [proposal, setProposal] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [gig, setGig] = useState<any>(null);
  const [disputeDescription, setDisputeDescription] = useState("");
  const { address } = useAccount();
  const BASContractAddress = "0x6c2270298b1e6046898a322acB3Cbad6F99f7CBD"; //bnb testnet
  const bas = new BAS(BASContractAddress);
  const signer = useEthersSigner({ chainId: bscTestnet.id });
  const [resolvedClientAddress, setResolvedClientAddress] = useState("");
  const [resolvedFreelancerAddress, setResolvedFreelancerAddress] =
    useState("");
  const [refresh, setRefresh] = useState(false);
  const web3name = createWeb3Name();

  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: "orange-select-opossum-767.mypinata.cloud",
  });

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gig/${params.uid}/applicants`
        );
        console.log(response.data[0]);
        setGig(response.data[0]);
        setIsClient(response.data[0].clientAddress == address?.toLowerCase());
        const clientResolvedname: any = await resolveAddressToName(
          response.data[0].clientAddress
        );
        setResolvedClientAddress(
          clientResolvedname
            ? clientResolvedname
            : response.data[0].clientAddress.slice(0, 4) +
                "..." +
                response.data[0].clientAddress.slice(-4)
        );

        if (response.data[0].isAccepted) {
          const freelancerResolvedname = await resolveAddressToName(
            response.data[0].freelancerAddress
          );

          setResolvedFreelancerAddress(
            freelancerResolvedname
              ? freelancerResolvedname
              : response.data[0].freelancerAddress.slice(0, 4) +
                  "..." +
                  response.data[0].freelancerAddress.slice(-4)
          );
        }
      } catch (error) {
        console.error("Error fetching gig:", error);
      }
    };

    if (address) fetchGig();
  }, [params.uid, address, refresh]);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        if (gig && gig.videoIpfsHash) {
          console.log(gig.videoIpfsHash);
          const file = await pinata.gateways.get(gig.videoIpfsHash);
          console.log(file.data);
          const url = URL.createObjectURL(file.data as any);
          setVideoUrl(url); // Step 2: Set the video URL state
          console.log(url);
        }
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    };

    if (gig && gig.videoIpfsHash) {
      fetchVideo(); // Trigger video fetch when gig and videoHash are available
    }
  }, [gig]); // Dependency on gig to re-fetch when gig data changes

  const handleApplicationProposal = async () => {
    try {
      updateStepStatus(setApplySteps, 0, "loading");
      const txhash = await walletClient.writeContract({
        account: address!,
        address: gig.gigContractAddress,
        abi: GigContractABI,
        functionName: "applyForGig",
        args: [proposal],
      });
      console.log(txhash);
      const recipet = await publicClient.waitForTransactionReceipt({
        hash: txhash,
      });
      updateStepStatus(setApplySteps, 0, "complete");
    } catch (error) {
      console.log(error);
      updateStepStatus(setApplySteps, 0, "error");
    }
  };

  const [applySteps, setApplySteps] = useState([
    { label: "Contract Interaction", status: "idle" as StepStatus },
    { label: "Indexing", status: "idle" as StepStatus },
  ]);
  const [isApplying, setIsApplying] = useState(false);
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsApplying(true);
      await handleApplicationProposal();
      updateStepStatus(setApplySteps, 1, "loading");
      const data = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gig/${params.uid}`,
        { freelancerAddress: address, proposal: proposal }
      );
      console.log(data);
      updateStepStatus(setApplySteps, 1, "complete");
    } catch (error) {
      console.log(error);
      updateStepStatus(setApplySteps, 1, "error");
    } finally {
      setProposal("");

      setTimeout(() => {
        setIsApplying(false);
      }, 2000);
      setRefresh((prevRefresh) => !prevRefresh);
    }
  };

  // Stepper for application
  const [applicationSteps, setApplicationSteps] = useState([
    { label: "Attestation", status: "idle" as StepStatus },
    { label: "Contract Interaction", status: "idle" as StepStatus },
    { label: "Indexing", status: "idle" as StepStatus },
  ]);

  const [isAccepting, setIsAccepting] = useState(false);

  const handleApplicationAccept = async (
    applicantUID: string,
    applicantAddress: string
  ) => {
    // This is where we write the agreement
    setIsAccepting(true);
    try {
      updateStepStatus(setApplicationSteps, 0, "loading");
      const schemaEncoder = new SchemaEncoder(gigAgreement);
      const encodedData = schemaEncoder.encodeData([
        { name: "gigTitle", value: gig.gigName, type: "string" },
        { name: "refUID", value: gig.uid, type: "bytes32" },
        { name: "gigDescription", value: gig.gigDescription, type: "string" },
        { name: "gigDeadline", value: gig.deadline, type: "uint256" },
        { name: "gigBudget", value: gig.budget, type: "uint256" },
        { name: "gigClientUID", value: gig.clientUID, type: "bytes32" },
        { name: "gigApplicantUID", value: applicantUID, type: "bytes32" },
        {
          name: "gigContractAddress",
          value: gig.gigContractAddress,
          type: "address",
        },
      ]);
      const schemaUID = gigAgreementUID;
      bas.connect(signer!);
      const tx = await bas.attest({
        schema: schemaUID,
        data: {
          recipient: gig.gigContractAddress,
          expirationTime: BigInt(0),
          revocable: true, // Be aware that if your schema is not revocable, this MUST be false
          data: encodedData,
        },
      });
      const agreementUID = await tx.wait();
      console.log(agreementUID);
      updateStepStatus(setApplicationSteps, 0, "complete");

      //Write to contract
      updateStepStatus(setApplicationSteps, 1, "loading");
      const txhash = await walletClient.writeContract({
        account: address!,
        address: gig.gigContractAddress,
        abi: GigContractABI,
        functionName: "chooseFreelancer",
        args: [applicantAddress, agreementUID],
      });
      console.log(txhash);
      const reciept = await publicClient.waitForTransactionReceipt({
        hash: txhash,
      });
      updateStepStatus(setApplicationSteps, 1, "complete");

      // Store this in db to index

      updateStepStatus(setApplicationSteps, 2, "loading");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gig/${gig.uid}`,
        {
          AggrementUid: agreementUID,
          freelancerAddress: applicantAddress,
          isAccepted: true,
          freelancerUID: applicantUID,
          IsCompleted: false,
        }
      );
      console.log(response.data);
      updateStepStatus(setApplicationSteps, 2, "complete");
    } catch (error) {
      const currentStep = applicationSteps.findIndex(
        (step) => step.status === "loading"
      );
      if (currentStep !== -1) {
        updateStepStatus(setApplicationSteps, currentStep, "error");
      }
      console.log(error);
    } finally {
      setTimeout(() => setIsAccepting(false), 2000);
      setRefresh((prevRefresh) => !prevRefresh);
    }
  };

  const [raiseDisputeSteps, setRaiseDisputeSteps] = useState([
    { label: "Attestation", status: "idle" as StepStatus },
    { label: "Contract Interaction", status: "idle" as StepStatus },
    { label: "Indexing", status: "idle" as StepStatus },
  ]);
  const [isDisputing, setIsDisputing] = useState(false);
  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsDisputing(true);
      updateStepStatus(setRaiseDisputeSteps, 0, "loading");
      const schemeEncoder = new SchemaEncoder(gigDisputeSchema);
      const encodedData = schemeEncoder.encodeData([
        { name: "refUID", value: gig.uid, type: "bytes32" },
        {
          name: "disputeDescription",
          value: disputeDescription,
          type: "string",
        },
        { name: "clientUID", value: gig.clientUID, type: "bytes32" },
        { name: "freelancerUID", value: gig.freelancerUID, type: "bytes32" },
      ]);
      const schemaUID = gigDisputeSchemaUID;
      bas.connect(signer!);
      const tx = await bas.attest({
        schema: schemaUID,
        data: {
          recipient: gig.gigContractAddress,
          expirationTime: BigInt(0),
          revocable: true, // Be aware that if your schema is not revocable, this MUST be false
          data: encodedData,
        },
      });
      const disputeUID = await tx.wait();
      console.log(disputeUID);
      updateStepStatus(setRaiseDisputeSteps, 0, "complete");

      // Write the dispute in the contract

      updateStepStatus(setRaiseDisputeSteps, 1, "loading");
      const txhash = await walletClient.writeContract({
        account: address!,
        address: gig.gigContractAddress,
        abi: GigContractABI,
        functionName: "raiseDispute",
        args: [disputeUID, disputeDescription],
      });

      const reciept = await publicClient.waitForTransactionReceipt({
        hash: txhash,
      });
      console.log(reciept.logs);
      updateStepStatus(setRaiseDisputeSteps, 1, "complete");

      // Store the states in indexer
      updateStepStatus(setRaiseDisputeSteps, 2, "loading");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gig/${gig.uid}`,
        {
          isDisputeRaised: true,
          disputeAttestationUID: disputeUID,
          disputeDescription: disputeDescription,
          isDisputed: false,
        }
      );
      console.log(response.data);
      if (response.data) {
        updateStepStatus(setRaiseDisputeSteps, 2, "complete");
      }
    } catch (error) {
      const currentStep = raiseDisputeSteps.findIndex(
        (step) => step.status === "loading"
      );
      if (currentStep !== -1) {
        updateStepStatus(setRaiseDisputeSteps, currentStep, "error");
      }
      console.log(error);
    } finally {
      setTimeout(() => setIsDisputing(false), 2000);
      setRefresh((prevRefresh) => !prevRefresh);
    }
  };

  const [acceptWorkSteps, setAcceptWorksSteps] = useState([
    { label: "Contract Interaction", status: "idle" as StepStatus },
    { label: "Store in Indexer", status: "idle" as StepStatus },
  ]);

  const [isAcceptingWork, setIsAcceptingWork] = useState(false);

  const handleAcceptWork = async () => {
    try {
      setIsAcceptingWork(true);
      updateStepStatus(setAcceptWorksSteps, 0, "loading");
      const txhash = await walletClient.writeContract({
        account: address!,
        address: gig.gigContractAddress,
        abi: GigContractABI,
        functionName: "pay",
      });
      console.log(txhash);
      const reciept = await publicClient.waitForTransactionReceipt({
        hash: txhash,
      });

      updateStepStatus(setAcceptWorksSteps, 0, "complete");
      // Store the states in indexer
      updateStepStatus(setAcceptWorksSteps, 1, "loading");
      const reponse = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gig/${gig.uid}`,
        {
          IsCompleted: true,
          decision: "Accepted by the client",
        }
      );
      console.log(reponse.data);
      if (reponse.data) {
        updateStepStatus(setAcceptWorksSteps, 1, "complete");
      }
    } catch (error) {
      const currentStep = acceptWorkSteps.findIndex(
        (step) => step.status === "loading"
      );
      if (currentStep !== -1) {
        updateStepStatus(setAcceptWorksSteps, currentStep, "error");
      }
      console.log(error);
    } finally {
      setTimeout(() => setIsAcceptingWork(false), 2000);
      setRefresh((prevRefresh) => !prevRefresh);
    }
  };

  if (!gig) {
    return (
      <div className="min-h-screen bg-[#FDF7F0] py-12 px-4">
        <Navbar />
        <div className="container mx-auto max-w-4xl">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7F0] py-12 px-4">
      <Navbar />
      <div className="container mx-auto max-w-4xl mt-4">
        <StepperModal
          isOpen={isAccepting}
          steps={applicationSteps}
          title={"Accepting Application"}
        />
        <StepperModal
          isOpen={isApplying}
          steps={applySteps}
          title={"Applying to a gig"}
        />
        <StepperModal
          isOpen={isDisputing}
          steps={raiseDisputeSteps}
          title={"Raising a Dispute"}
        />
        <StepperModal
          isOpen={isAcceptingWork}
          steps={acceptWorkSteps}
          title={"Accepting the work"}
        />

        <Card className="mb-8 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A] radius-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-[#1E3A8A]">
              {gig.gigName}
            </CardTitle>
            <CardDescription className="text-[#FF5C00]">
              Posted on {new Date(gig.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[#1E3A8A]">{gig.gigDescription}</p>
            <div className="flex flex-wrap gap-2">
              {gig.tags.map((tag: any, index: number) => (
                <span
                  key={index}
                  className="bg-[#FFE1A1] text-[#1E3A8A] px-2 py-1 rounded-full text-sm flex items-center"
                >
                  <Tag size={14} className="mr-1" /> {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <DollarSign className="text-[#FF5C00] mr-2" />
                <span className="text-[#1E3A8A] font-bold">
                  Budget: ${gig.budget}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="text-[#FF5C00] mr-2" />
                <span className="text-[#1E3A8A] font-bold">
                  Deadline: {new Date(gig.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <Briefcase className="text-[#FF5C00] mr-2" />
              <span className="text-[#1E3A8A] font-bold">
                Contract Address: {gig.gigContractAddress}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="text-[#FF5C00] mr-2" />
              <span className="text-[#1E3A8A] font-bold">
                Applicants: {gig.applicants.length}
              </span>
            </div>
            <div className="flex items-center">
              <User className="text-[#FF5C00] mr-2" />
              <span className="text-[#1E3A8A] font-bold">
                Client: {resolvedClientAddress}
              </span>
            </div>
            {gig.isAccepted && (
              <div className="flex items-center">
                <User className="text-[#FF5C00] mr-2" />
                <span className="text-[#1E3A8A] font-bold">
                  Freelancer: {resolvedFreelancerAddress}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        {!isClient && !gig.isAccepted && (
          <Card className="mb-8 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#1E3A8A]">
                Apply for this Gig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApply}>
                <Textarea
                  placeholder="Write your proposal here..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  className="mb-4 border-2 border-[#1E3A8A] focus:ring-[#FF5C00] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all text-[#1E3A8A]"
                />
                <Button
                  type="submit"
                  className="w-full bg-[#FF5C00] text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all hover:[&:not(:disabled)]:bg-[#1E3A8A]"
                >
                  Submit Proposal
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        {isClient && !gig.isAccepted && (
          <Card className="mb-8 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#1E3A8A]">
                Applicants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gig.applicants.map((applicant: any, index: number) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-white rounded-lg border-2 border-[#1E3A8A] flex justify-between items-center"
                >
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Avatar className="mr-2">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${applicant.freelancerAddress}`}
                        />
                        <AvatarFallback>FL</AvatarFallback>
                      </Avatar>
                      <span className="text-[#1E3A8A] font-bold">
                        {applicant.freelancerAddress.slice(0, 6)}...
                        {applicant.freelancerAddress.slice(-4)}
                      </span>
                    </div>
                    <p className="text-[#1E3A8A]">{applicant.proposal}</p>
                  </div>
                  <Button
                    className="px-6 py-2 bg-[#FF5C00] rounded-full font-bold text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all hover:[&:not(:disabled)]:bg-[#1E3A8A]"
                    onClick={() => {
                      handleApplicationAccept(
                        applicant.freelancerDetails.uid,
                        applicant.freelancerAddress
                      );
                    }}
                  >
                    Accept
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {/* {gig.freelancerAddress === address &&
          gig.isAccepted &&
          !gig.IsSubmitted && ( */}
        {!isClient && gig.isAccepted && !gig.IsSubmitted && (
          <div>
            <Submission
              description={
                "Apply for gig feature , with a textbox and submit proposal button.The button should be in green color."
              }
              gigContarctAddress={gig.gigContractAddress}
              gigUID={gig.uid}
              freelancerUID={gig.freelancerUID}
            />
          </div>
        )}

        {gig.isAccepted && gig.IsSubmitted && videoUrl && !gig.IsCompleted && (
          <Card className="mb-8 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#1E3A8A]">
                Evaluate Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-2 ">
                <VideoPlayer videoUrl={videoUrl} />{" "}
                <div className="flex flex-col gap-2 border-2 border-[#1E3A8A] p-1">
                  <p className="text-[#1E3A8A]">Score : {gig.AIScore}</p>
                  <p className="text-[#1E3A8A]">Feedback : {gig.AIFeedback}</p>
                </div>
                {!gig.isDisputeRaised && (
                  <div>
                    <Textarea
                      placeholder="Write your conflict here..."
                      value={disputeDescription}
                      onChange={(e) => setDisputeDescription(e.target.value)}
                      className="mb-4 border-2 border-[#1E3A8A] focus:ring-[#FF5C00] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all text-[#1E3A8A]"
                    />
                    <div className="flex justify-end gap-2">
                      {isClient && (
                        <Button
                          onClick={handleAcceptWork}
                          className="px-6 py-2 bg-[#FF5C00] rounded-full font-bold text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all hover:[&:not(:disabled)]:bg-[#1E3A8A]"
                        >
                          Accept
                        </Button>
                      )}
                      <Button
                        onClick={handleRaiseDispute}
                        className="px-6 py-2 bg-[#FF5C00] rounded-full font-bold text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all hover:[&:not(:disabled)]:bg-[#1E3A8A]"
                      >
                        Raise Dispute
                      </Button>
                    </div>
                  </div>
                )}
                {gig.isDisputeRaised && (
                  <div className="flex justify-end gap-2 text-[#1E3A8A]">
                    <Link
                      href={`/gigs/dispute/${gig.uid}`}
                      className="border-dotted border-2 border-[#1E3A8A] px-2 py-1 inline-block"
                    >
                      Dispute Raised →
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {gig.IsCompleted && (
          <Card className="mb-8 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#1E3A8A]">
                Work Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex flex-col gap-2 border-2 border-[#1E3A8A] p-1">
                  <p className="text-[#1E3A8A]">Score : {gig.AIScore}</p>
                  <p className="text-[#1E3A8A]">Feedback : {gig.AIFeedback}</p>
                  <p className="text-[#1E3A8A]">Decision : {gig.decision}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GigPage;
