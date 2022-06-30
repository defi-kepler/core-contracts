import { ethers} from 'hardhat'
//DFT 
const dft = "0x9E0F035628Ce4F5e02ddd14dEa2F7bd92B2A9152";
const usdt = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684";
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(dft);

  await treasury.deployed();

  console.log("treasury deployed to:", treasury.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
