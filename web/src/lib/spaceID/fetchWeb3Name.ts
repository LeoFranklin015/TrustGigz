import axios from "axios";

export const FetchWeb3Name = async (web3name: any, address: any) => {
  if (address) {
    try {
      // const webName = await web3name.getDomainName(address, {
      //   rpcURL: "https://ethereum-rpc.publicnode.com",
      // });
      // console.log("Fetched Web3 Name:", webName);
      const response = await axios.get(
        `https://api.prd.space.id/v1/getName?tld=eth&address=${address}`
      );
      if (response.data.name) {
        return response.data.name;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching Web3 name:", error);
    }
  }
};

export const resolveAddressToName = async (web3name: any, address: string) => {
  try {
    const response = await axios.get(
      `https://api.prd.space.id/v1/getName?tld=eth&address=${address}`
    );

    const webName = response.data.name;
    return webName || address.slice(0, 6) + "..." + address.slice(-4);
  } catch (error) {
    console.error("Error resolving name:", error);
    return address.slice(0, 6) + "..." + address.slice(-4);
  }
};
