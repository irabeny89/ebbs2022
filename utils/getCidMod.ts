import { Web3Storage } from "web3.storage";

const getCidMod = async (web3StorageClient: Web3Storage, file: File) =>
  `${encodeURIComponent(file.name)}:${await web3StorageClient.put([file])}`;

export default getCidMod;
