"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { createWeb3Name } from "@web3-name-sdk/core";
import { FetchWeb3Name } from "@/lib/spaceID/fetchWeb3Name";
import { useAccount } from "wagmi";

// Separate component for ConnectButton
const NavbarConnectButton = () => {
  const web3name = useMemo(() => createWeb3Name(), []);
  const [web3Name, setWeb3Name] = useState("");

  const [lastFetchedAddress, setLastFetchedAddress] = useState("");
  const { address } = useAccount();
  const handleFetchWeb3Name = useCallback(async (address: string) => {
    if (address && address !== lastFetchedAddress) {
      try {
        const webName = await FetchWeb3Name(web3name, address);
        console.log(webName);
        if (webName) {
          setWeb3Name(webName);
          setLastFetchedAddress(address);
        }
      } catch (error) {
        console.error("Failed to fetch Web3 Name:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (address && address != lastFetchedAddress) {
      console.log(address);
      handleFetchWeb3Name(address);
    }
  }, [address]);
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                type="button"
                className="px-6 py-2 bg-[#FF5C00] rounded-full font-bold text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all"
              >
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                type="button"
                className="px-6 py-2 bg-[#FF5C00] rounded-full font-bold text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all"
              >
                Wrong network
              </button>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={openChainModal}
                  style={{ display: "flex", alignItems: "center" }}
                  type="button"
                  className="px-6 py-2 bg-[#FFE1A1] rounded-full font-bold text-black border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all"
                >
                  {chain.hasIcon && (
                    <div
                      style={{
                        background: chain.iconBackground,
                        width: 24,
                        height: 23,
                        borderRadius: 999,
                        overflow: "hidden",
                        marginRight: 4,
                      }}
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          style={{ width: 24, height: 24 }}
                        />
                      )}
                    </div>
                  )}
                  {chain.name}
                </button>

                <button
                  onClick={openAccountModal}
                  type="button"
                  className="px-6 py-2 bg-[#FF5C00] rounded-full font-bold text-white border-2 border-[#1E3A8A] shadow-[0_4px_0_0_#1E3A8A] hover:shadow-[0_2px_0_0_#1E3A8A] hover:translate-y-[2px] transition-all"
                >
                  {web3Name || account.displayName}
                  {account.displayBalance ? ` (${account.displayBalance})` : ""}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

// Main Navbar component
const Navbar = () => {
  return (
    <nav className="border-b border-black bg-[#FDF7F0] p-2 w-full mx-auto">
      <div className="w-full mx-auto flex items-center justify-between px-8">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-3xl font-black text-black">
            TrustGigz
          </Link>
        </div>
        <div className="hidden lg:flex items-center space-x-6 text-black justify-between">
          <Link
            href="/yourgigs"
            className="hover:text-[#FF5C00] transition-colors font-medium"
          >
            Your Gigs
          </Link>
          <Link
            href="/post-gig"
            className="hover:text-[#FF5C00] transition-colors font-medium"
          >
            Post a Gig
          </Link>
          <Link
            href="/gigs"
            className="hover:text-[#FF5C00] transition-colors font-medium"
          >
            Find a Gig
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <NavbarConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
