import hre from "hardhat";

async function main() {
  const Contract = await hre.ethers.deployContract("MedicalDataLedger");
  await Contract.waitForDeployment();
  console.log("Contract deployed to:", await Contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
