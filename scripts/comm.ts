import { ethers} from 'hardhat'
import { MockErc20 } from '../typechain/MockErc20'
import { Treasury } from '../typechain/Treasury'
const erc20_address = "0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684"
const treasury_address = "0x527bE5D49A722b2520CE4F69B52F56ec84daA24E"
const dispatcher_address = "0xdB482C6f913599f803c106163Ca7ac21577e400A"
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  approve()

}

async function deposit() {
    let treasury = await ethers.getContractAt( "Treasury", treasury_address);
    await treasury.deposit(100)
}

async function approve() {
    let erc20 = await ethers.getContractAt( "MockERC20", erc20_address);
    await erc20.approve(treasury_address, 100000000)
}

async function dispatch() {
  let dispatcher = await ethers.getContractAt( "Dispatcher", dispatcher_address);
  await dispatcher.dispatch()
}

async function addStrategy() {
  let dispatcher = await ethers.getContractAt( "Dispatcher", dispatcher_address);
  await dispatcher.addStrategys("0x459E57Ac77E5B0e8BcB254ff887d4892B12dA6F6", 100);
}
  
async function farmstgySetPoolId() {
  let lpFarmStrategy = await ethers.getContractAt( "LPFarmStrategy", "0x459E57Ac77E5B0e8BcB254ff887d4892B12dA6F6");
  await lpFarmStrategy.setPoolId(4);
}
async function farmstgySetOperator() {
  let lpFarmStrategy = await ethers.getContractAt( "LPFarmStrategy", "0x459E57Ac77E5B0e8BcB254ff887d4892B12dA6F6");
  await lpFarmStrategy.setOperator(dispatcher_address, true);
}
  


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
farmstgySetOperator()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });