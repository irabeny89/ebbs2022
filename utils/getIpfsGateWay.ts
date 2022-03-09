const getIpfsGateWay = (moddedCid: string) =>
  `https://ipfs.io/ipfs/${moddedCid.split(":")[1]}/${moddedCid.split(":")[0]}`;

export default getIpfsGateWay;
