import config from "../config";
import { Web3Storage } from "web3.storage";

const web3storage = new Web3Storage({
  token: config.environmentVariable.web3storageKey!,
});
export default web3storage;
