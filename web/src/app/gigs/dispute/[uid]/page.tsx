"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Tag,
  User,
  Users,
} from "lucide-react";
import Navbar from "@/components/ui/navbar";
import { RotatingSlider } from "@/components/ui/RotatingSlider";
import axios from "axios";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { verifyEVMMessageSignature } from "@/lib/verifyZKPass";
import { BAS, SchemaEncoder } from "@bnb-attestation-service/bas-sdk";
import { publicClient, useEthersSigner, walletClient } from "@/lib/viemClient";
import { bscTestnet } from "viem/chains";
import {
  disputeAttestationSchema,
  disputeAttestationSchemaUID,
} from "@/lib/const";
import { useAccount } from "wagmi";
import { GigContractABI } from "@/lib/abis/GigContract";
import { decodeEventLog } from "viem";
import { VideoPlayer } from "@/components/ui/videoPlayer";
import { PinataSDK } from "pinata-web3";
import {
  StepperModal,
  StepStatus,
  updateStepStatus,
} from "@/components/modals/Stepper";
import { resolveAddressToName } from "@/lib/spaceID/fetchWeb3Name";

const DisputeResolutionPage = ({ params }: { params: { uid: string } }) => {
  const [clientFavor, setClientFavor] = useState(50);
  const [decision, setDecision] = useState("");
  const [gig, setGig] = useState<any>(null);
  const [validator, setValidator] = useState<any>(null);
  const [verified, setVerified] = useState<Boolean | null>(null);
  const [disputes, setDisputes] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const BASContractAddress = "0x6c2270298b1e6046898a322acB3Cbad6F99f7CBD"; //bnb testnet
  const bas = new BAS(BASContractAddress);
  const signer = useEthersSigner({ chainId: bscTestnet.id });
  const { address } = useAccount();

  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: "orange-select-opossum-767.mypinata.cloud",
  });

  const [resolvedClientAddress, setResolvedClientAddress] = useState("");
  const [resolvedFreelancerAddress, setResolvedFreelancerAddress] =
    useState("");

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

  const [decisionSteps, setDecisionSteps] = useState([
    { label: "VoteAttestation", status: "idle" as StepStatus },
    { label: "Indexing", status: "idle" as StepStatus },
  ]);

  const [isDecisionSubmitted, setIsDecisionSubmitted] = useState(false);
  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsDecisionSubmitted(true);
      updateStepStatus(setDecisionSteps, 0, "loading");
      console.log("Decision submitted:", { clientFavor, decision });
      const schemaEncoder = new SchemaEncoder(disputeAttestationSchema);
      ("bytes32 refUID,bytes32 validatorUID,address validatorAddress,uint256 clientFavor,string validationDescripton");

      const encodedData = schemaEncoder.encodeData([
        { name: "refUID", value: gig.disputeAttestationUID, type: "bytes32" },
        {
          name: "validatorUID",
          value: validator.uid,
          type: "bytes32",
        },
        { name: "validatorAddress", value: address, type: "address" },
        { name: "clientFavor", value: clientFavor, type: "uint256" },
        { name: "validationDescripton", value: decision, type: "string" },
      ]);

      const schemaUID = disputeAttestationSchemaUID;
      bas.connect(signer!);
      const tx = await bas.attest({
        schema: schemaUID,
        data: {
          recipient: gig.gigContractAddress,
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
        },
      });

      const attestationUID = await tx.wait();
      console.log(attestationUID);
      updateStepStatus(setDecisionSteps, 0, "complete");

      // Store this data to index this.
      try {
        updateStepStatus(setDecisionSteps, 1, "loading");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dispute`,
          {
            uid: attestationUID,
            refUID: gig.disputeAttestationUID,
            validatorAddress: address,
            validatorUID: validator.uid,
            clientFavor: clientFavor,
            validationDescription: decision,
          }
        );

        console.log(response.data);
        if (response.data) {
          updateStepStatus(setDecisionSteps, 1, "complete");
        }
      } catch (error) {
        updateStepStatus(setDecisionSteps, 1, "error");
        console.log(error);
      }
    } catch (error) {
      updateStepStatus(setDecisionSteps, 0, "error");
      console.log(error);
    } finally {
      setTimeout(() => {
        setIsDecisionSubmitted(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gig/${params.uid}/applicants`
        );
        console.log(response.data[0]);
        setGig(response.data[0]);
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

    fetchGig();
  }, [params.uid]);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dispute/${gig.disputeAttestationUID}`
        );
        console.log(response.data);
        setDisputes(response.data);
      } catch (error) {
        console.error("Error fetching disputes:", error);
      }
    };
    if (gig) {
      fetchDisputes();
    }
  }, [gig]);

  useEffect(() => {
    const fetchvalidator = async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/freelancer/${address}`
      );
      console.log(response.data);
      setValidator(response.data);
    };
    if (address) {
      fetchvalidator();
    }
  }, [address]);

  const calculateTotalPercentage = () => {
    let totalFreelancerVotePercentage = 0;
    disputes.forEach((dispute: any) => {
      totalFreelancerVotePercentage += dispute.clientFavor;
    });

    totalFreelancerVotePercentage /= disputes.length;

    let totalClientVotePercentage = 100 - totalFreelancerVotePercentage;
    totalFreelancerVotePercentage = Math.floor(totalFreelancerVotePercentage);
    totalClientVotePercentage = Math.floor(totalClientVotePercentage);
    return { totalFreelancerVotePercentage, totalClientVotePercentage };
  };

  const [resolveDisputeSteps, setResolveDisputeSteps] = useState([
    { label: "Contract Interaction", status: "idle" as StepStatus },
    { label: "Indexing", status: "idle" as StepStatus },
  ]);

  const [isResolveDisputeSubmitted, setIsResolveDisputeSubmitted] =
    useState(false);

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsResolveDisputeSubmitted(true);
      updateStepStatus(setResolveDisputeSteps, 0, "loading");
      const { totalFreelancerVotePercentage, totalClientVotePercentage } =
        calculateTotalPercentage();

      const txhash = await walletClient.writeContract({
        account: address!,
        address: gig.gigContractAddress,
        abi: GigContractABI,
        functionName: "resolveDispute",
        args: [totalClientVotePercentage, totalFreelancerVotePercentage],
      });
      await publicClient.waitForTransactionReceipt({
        hash: txhash,
      });
      console.log(txhash);

      const reciept = await publicClient.waitForTransactionReceipt({
        hash: txhash,
      });
      console.log(reciept.logs);

      const eventLogs = decodeEventLog({
        abi: GigContractABI,
        data: reciept.logs[0].data,
        topics: reciept.logs[0].topics,
      });
      console.log(eventLogs);

      const decision = (eventLogs.args as any).decision;

      console.log(decision);

      updateStepStatus(setResolveDisputeSteps, 0, "complete");

      // Store this data to indexer
      updateStepStatus(setResolveDisputeSteps, 1, "loading");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gig/${gig.uid}`,
        {
          isDisputed: true,
          decision: decision,
          IsCompleted: true,
        }
      );

      console.log(response.data);
      if (response.data) {
        updateStepStatus(setResolveDisputeSteps, 1, "complete");
      }
    } catch (error) {
      const currentStep = resolveDisputeSteps.findIndex(
        (step) => step.status === "loading"
      );
      if (currentStep !== -1) {
        updateStepStatus(setResolveDisputeSteps, currentStep, "error");
      }
      console.log(error);
    } finally {
      setTimeout(() => {
        setIsResolveDisputeSubmitted(false);
      }, 2000);
    }
  };

  const verify = async () => {
    try {
      const appid = "5c791946-486c-4939-b8fa-ed022dfd4c4a";

      const connector = new TransgateConnect(appid);

      const isAvailable = await connector.isTransgateAvailable();

      if (isAvailable) {
        const schemaId = "e2b921f5f6744ef9bb6aab5ee1623a76";
        const res: any = await connector.launch(schemaId);

        console.log(res);

        const verifyRes = verifyEVMMessageSignature(
          res.taskId,
          schemaId,
          res.uHash,
          res.publicFieldsHash,
          res.validatorSignature,
          res.validatorAddress
        );

        console.log(verifyRes);
        setVerified(verifyRes);
        // verifiy the res onchain/offchain based on the requirement
      } else {
        console.log("Please install TransGate");
      }
    } catch (error) {
      console.log("transgate error", error);
    }
  };

  if (!gig) {
    return (
      <div className="min-h-screen bg-[#FDF7F0]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-black text-[#1E3A8A] mb-8">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <StepperModal
          isOpen={isDecisionSubmitted}
          steps={decisionSteps}
          title={"Voting on Dipsute"}
        />
        <StepperModal
          isOpen={isResolveDisputeSubmitted}
          steps={resolveDisputeSteps}
          title={"Resolving Dipsute"}
        />
        <h1 className="text-4xl font-black text-[#1E3A8A] mb-8">
          Dispute Resolution
        </h1>

        {/* Gig Details Card */}
        <Card className="mb-4 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A] overflow-hidden">
          <CardHeader className="bg-[#FFE1A1] border-b-2 border-[#1E3A8A]">
            <CardTitle className="text-3xl font-black text-[#1E3A8A]">
              {gig.gigName}
            </CardTitle>
            <CardDescription className="text-[#FF5C00] font-semibold">
              Posted on {new Date(gig.createdAt.$date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-6">
            <p className="text-[#1E3A8A] text-lg">{gig.gigDescription}</p>
            <div className="flex flex-wrap gap-2">
              {gig.tags.map((tag: any, index: number) => (
                <span
                  key={index}
                  className="bg-[#FFE1A1] text-[#1E3A8A] px-3 py-1 rounded-full text-sm flex items-center font-medium"
                >
                  <Tag size={14} className="mr-2" /> {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center bg-[#FDF7F0] p-3 rounded-lg">
                <DollarSign className="text-[#FF5C00] mr-3" size={24} />
                <span className="text-[#1E3A8A] font-bold text-lg">
                  Budget: ${gig.budget}
                </span>
              </div>
              <div className="flex items-center bg-[#FDF7F0] p-3 rounded-lg">
                <Calendar className="text-[#FF5C00] mr-3" size={24} />
                <span className="text-[#1E3A8A] font-bold text-lg">
                  Deadline: {new Date(gig.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center bg-[#FDF7F0] p-3 rounded-lg">
                <User className="text-[#FF5C00] mr-3" size={24} />
                <span className="text-[#1E3A8A] font-bold text-lg">
                  Client: {resolvedClientAddress}
                </span>
              </div>
            </div>
            <div className="flex items-center bg-[#FDF7F0] p-3 rounded-lg">
              <Briefcase className="text-[#FF5C00] mr-3" size={24} />
              <span className="text-[#1E3A8A] font-bold text-lg">
                Contract: {gig.gigContractAddress.slice(0, 6)}...
                {gig.gigContractAddress.slice(-4)}
              </span>
            </div>
            <div className="flex items-center bg-[#FDF7F0] p-3 rounded-lg">
              <Users className="text-[#FF5C00] mr-3" size={24} />
              <span className="text-[#1E3A8A] font-bold text-lg">
                Freelancer: {resolvedFreelancerAddress}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dispute History Card */}
        <Card className="mb-8 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A] overflow-hidden">
          <CardHeader className="bg-[#FFE1A1] border-b-2 border-[#1E3A8A]">
            <CardTitle className="text-2xl font-bold text-[#1E3A8A]">
              Submitted Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="mb-4 flex flex-col gap-2 justify-center items-center">
              <VideoPlayer videoUrl={videoUrl} />{" "}
              <div className="flex flex-col gap-2 border-2 border-[#1E3A8A] p-1">
                <p className="text-[#1E3A8A]">Score : {gig.AIScore}</p>
                <p className="text-[#1E3A8A]">Feedback : {gig.AIFeedback}</p>
                <p className="text-[#1E3A8A]">
                  Dispute : {gig.disputeDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution Form */}

        {!gig.isDisputed && (
          <Card className="mb-8 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A] overflow-hidden">
            <CardHeader className="bg-[#FFE1A1] border-b-2 border-[#1E3A8A]">
              <CardTitle className="text-2xl font-bold text-[#1E3A8A]">
                Resolve Dispute
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex w-full justify-between items-center gap-2">
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">
                    Client Favor
                  </h3>
                  <RotatingSlider
                    value={clientFavor}
                    onChange={setClientFavor}
                  />
                  <p className="mt-2 text-[#1E3A8A] font-bold">
                    {clientFavor}%
                  </p>
                </div>
                <div className="flex flex-col items-center w-full">
                  <Textarea
                    placeholder="Enter your decision here..."
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    className="min-h-[150px] border-2 border-[#1E3A8A] focus:ring-[#FF5C00] text-black placeholder:text-black"
                  />
                </div>
              </div>
              <div className="text-[#1E3A8A] text-sm">
                The validator must need to verify that he has done freelancing
                in Fiverr to showcase his expertise( for demo considering 0
                works)
              </div>
              <div className="flex items-center gap-4">
                <Button
                  disabled={
                    verified === null ? false : verified === true ? true : false
                  }
                  onClick={verify}
                  className={`w-full bg-[#FF5C00] text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all hover:bg-[#1E3A8A]${
                    verified === true
                      ? " opacity-50 cursor-not-allowed bg-green-500 "
                      : verified === false
                      ? " opacity-50 cursor-not-allowed bg-red-500"
                      : ""
                  }`}
                >
                  {verified === null
                    ? "Verify"
                    : verified === true
                    ? "Verified ✅"
                    : "Not Verified ❌"}
                </Button>
                <Button
                  disabled={
                    verified === null ? true : verified === true ? false : true
                  }
                  onClick={handleSubmitDecision}
                  className="w-full bg-[#FF5C00] text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all hover:bg-[#1E3A8A]"
                >
                  Submit Decision
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 border-2 border-[#1E3A8A] shadow-[0_6px_0_0_#1E3A8A] overflow-hidden">
          <CardHeader className="bg-[#FFE1A1] border-b-2 border-[#1E3A8A]">
            <CardTitle className="text-2xl font-bold text-[#1E3A8A] flex justify-between items-center">
              <div>Recent Validations</div>
              {gig.isDisputed ? (
                <div className="text-[#FF5C00] text-sm">{gig.decision}</div>
              ) : (
                <Button
                  onClick={handleResolveDispute}
                  className="bg-[#FF5C00] text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all hover:bg-[#1E3A8A]"
                >
                  Resolve
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {disputes &&
              disputes.map((dispute: any, index: number) => (
                <div
                  key={index}
                  className="bg-[#FDF7F0] p-4 rounded-lg border-2 border-[#1E3A8A]"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#1E3A8A] font-bold">
                      {dispute.validatorAddress.slice(0, 6)}...
                      {dispute.validatorAddress.slice(-4)}
                    </span>
                    <span className="text-[#FF5C00] font-bold">
                      {dispute.clientFavor}%
                    </span>
                  </div>
                  <p className="text-[#1E3A8A]">
                    {dispute.validationDescription}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisputeResolutionPage;
