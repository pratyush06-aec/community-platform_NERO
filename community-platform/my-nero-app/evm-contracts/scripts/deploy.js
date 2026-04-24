import hre from "hardhat";

async function main() {
  console.log("Deploying CommunityPlatform contract to NERO Testnet...");
  
  const contract = await hre.ethers.deployContract("CommunityPlatform");
  await contract.waitForDeployment();
  
  console.log(`CommunityPlatform successfully deployed to: ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
