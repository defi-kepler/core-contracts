import { ethers} from 'hardhat'
//DFT 
const busd = "0x9E0F035628Ce4F5e02ddd14dEa2F7bd92B2A9152";
const cake = "0x9E0F035628Ce4F5e02ddd14dEa2F7bd92B2A9152";
const usdt = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684";
const _lptoken = "0xa5D384fFc40bc6fc953F7D1381ccaa048C33505f"
const _router = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
const _farm = "0xF2C4565F9020850332527EC60d658F574Af598e5"
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Dispatcher = await ethers.getContractFactory("Dispatcher");
  const dispatcher = await Dispatcher.deploy(busd, usdt);
  await dispatcher.deployed();
  console.log("dispatcher deployed to:", dispatcher.address);

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(usdt, dispatcher.address);
  await treasury.deployed();
  console.log("treasury deployed to:", treasury.address);
  
  const WithdrawalAccount = await ethers.getContractFactory("WithdrawalAccount");
  const withdrawalAccount = await WithdrawalAccount.deploy(usdt, dispatcher.address);
  await withdrawalAccount.deployed();
  console.log("withdrawalAccount deployed to:", withdrawalAccount.address);

  const ChainBridgeStrategy = await ethers.getContractFactory("ChainBridgeStrategy");
  const chainBridgeStrategy = await ChainBridgeStrategy.deploy(usdt, dispatcher.address);
  await chainBridgeStrategy.deployed();
  console.log("chainBridgeStrategy deployed to:", chainBridgeStrategy.address);


  const LPFarmStrategy = await ethers.getContractFactory("LPFarmStrategy");
  const lpFarmStrategy = await LPFarmStrategy.deploy(_lptoken, cake, _router, _farm, dispatcher.address);
  await lpFarmStrategy.deployed();
//   await lpFarmStrategy.initApprove()
//   await lpFarmStrategy.setPoolId(4)
  console.log("lpFarmStrategy deployed to:", lpFarmStrategy.address);


  await dispatcher.addReceiver(lpFarmStrategy.address, 0, 100, 100)
  await dispatcher.addReceiver(chainBridgeStrategy.address, 1, 100, 0)
  await dispatcher.addReceiver(withdrawalAccount.address, 2, 100, 0)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
