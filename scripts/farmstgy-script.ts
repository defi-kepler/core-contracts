import { ethers} from 'hardhat'
//DFT 
const dft = "0x9E0F035628Ce4F5e02ddd14dEa2F7bd92B2A9152";
const usdt = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684";
const _lptoken = "0xa5D384fFc40bc6fc953F7D1381ccaa048C33505f"
const _router = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
const _farm = "0xF2C4565F9020850332527EC60d658F574Af598e5"
const _dispatcher = "0xdB482C6f913599f803c106163Ca7ac21577e400A"

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const LPFarmStrategy = await ethers.getContractFactory("LPFarmStrategy");
  const lpFarmStrategy = await LPFarmStrategy.deploy(_lptoken, dft, _router, _farm, _dispatcher);
  await lpFarmStrategy.deployed();
  await lpFarmStrategy.initApprove()
  await lpFarmStrategy.setPoolId(4)
  console.log("lpFarmStrategy deployed to:", lpFarmStrategy.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
