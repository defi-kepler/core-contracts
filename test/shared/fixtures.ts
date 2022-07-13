
import { ethers } from 'hardhat'
import { MockErc20 } from '../../typechain/MockErc20'
import { Treasury } from '../../typechain/Treasury'
import { WithdrawalAccount } from '../../typechain/WithdrawalAccount'
import {PancakeFactory  } from '../../typechain/PancakeFactory'
import { PancakeRouter } from '../../typechain/PancakeRouter'
import {Dispatcher} from '../../typechain/Dispatcher'
import {PancakePair} from '../../typechain/PancakePair'

import {LpFarmStrategy  } from '../../typechain/LpFarmStrategy'

import {LpFarmMock  } from '../../typechain/LpFarmMock'
import {ChainBridgeStrategy  } from '../../typechain/ChainBridgeStrategy'
export const TEST_POOL_START_TIME = 1601906400

interface DispatcherFixture {
    dispatcher: Dispatcher
    token0: MockErc20,
    token1: MockErc20,
    lpFarmStrategy: LpFarmStrategy,
    chainBridgeStrategy: ChainBridgeStrategy,
    withdrawalAccount: WithdrawalAccount,
    treasury: Treasury
    pancakeRouter: PancakeRouter,
    pancakePair: PancakePair
    farm : LpFarmMock

}

export async function dispatcherFixture(): Promise<DispatcherFixture> {
    //create PancakeFactory and PancakeRouter
    const [owner, owner1] = await ethers.getSigners();

    const PancakeFactoryClassType = await ethers.getContractFactory('PancakeFactory')
    let uniswapFactory = await PancakeFactoryClassType.deploy(owner.address) as PancakeFactory
    const PancakeRouterClassType = await ethers.getContractFactory('PancakeRouter')

    const tokenType = await ethers.getContractFactory('MockERC20')
    const token0 = (await tokenType.deploy()) as MockErc20
    const token1 = (await tokenType.deploy()) as MockErc20
    let pancakeRouter = await PancakeRouterClassType.deploy(uniswapFactory.address, uniswapFactory.address) as PancakeRouter
    
    //init pair
    await uniswapFactory.createPair(token0.address, token1.address)
    const pair = await uniswapFactory.getPair(token0.address, token1.address)
    const PancakePairClassType = await ethers.getContractFactory('PancakePair')
    const pancakePair= PancakePairClassType.attach(pair) as PancakePair

    // deploy Dispatcher
    const classType = await ethers.getContractFactory('Dispatcher')
    const dispatcher = await classType.deploy(token0.address, token1.address) as Dispatcher;
  

    //LPStrategy
    const farmToken = (await tokenType.deploy()) as MockErc20
    const farmClassType = await ethers.getContractFactory('LPFarmMock')
    const farm = await farmClassType.deploy(pair) as LpFarmMock;
    const LPFarmStrategyClassType = await ethers.getContractFactory('LPFarmStrategy')
    const lpFarmStrategy = await LPFarmStrategyClassType.deploy(pair, farmToken.address, pancakeRouter.address, farm.address, dispatcher.address) as LpFarmStrategy
    await dispatcher.addReceiver(lpFarmStrategy.address, 0, 100, 100)

      //ChainBridgeStrategy
      const ChainBridgeStrategyClassType = await ethers.getContractFactory('ChainBridgeStrategy')
      const chainBridgeStrategy = await ChainBridgeStrategyClassType.deploy(token0.address, dispatcher.address) as ChainBridgeStrategy
      await dispatcher.addReceiver(chainBridgeStrategy.address, 1, 100, 0)
      
    //WithdrawalAccount
    const WithdrawalAccountClassType = await ethers.getContractFactory('WithdrawalAccount')
    const withdrawalAccount = await WithdrawalAccountClassType.deploy(token0.address, dispatcher.address) as WithdrawalAccount;
    await dispatcher.addReceiver(withdrawalAccount.address, 2, 100, 0)
    
  

    //Treasury
    const TreasuryClassType = await ethers.getContractFactory('Treasury')
    const treasury = await TreasuryClassType.deploy(token0.address, dispatcher.address) as Treasury

    return { dispatcher, token0, token1, lpFarmStrategy, chainBridgeStrategy, withdrawalAccount, treasury , pancakeRouter, pancakePair, farm}
}



