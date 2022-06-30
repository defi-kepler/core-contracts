
import { ethers } from 'hardhat'
import { MockErc20 } from '../../typechain/MockErc20'
import { Treasury } from '../../typechain/Treasury'
import { WithdrawalAccount } from '../../typechain/WithdrawalAccount'
import { PancakeFactoryFactory } from '../../typechain/PancakeFactoryFactory'
import {PancakeFactory  } from '../../typechain/PancakeFactory'
import { PancakeRouter } from '../../typechain/PancakeRouter'
import {PancakeRouterFactory  } from '../../typechain/PancakeRouterFactory'
import {Dispatcher} from '../../typechain/Dispatcher'
import {PancakePair} from '../../typechain/PancakePair'
import { LpFarmStrategyFactory } from '../../typechain/LpFarmStrategyFactory'
import {LpFarmStrategy  } from '../../typechain/LpFarmStrategy'
import {OfflineInvestmentStrategy  } from '../../typechain/OfflineInvestmentStrategy'
export const TEST_POOL_START_TIME = 1601906400

interface MockERC20Fixture {
    token: MockErc20,
 }
 
 export async function mockERC20Fixture(): Promise<MockERC20Fixture> {
    const tokenType = await ethers.getContractFactory('MockERC20')
    const token = (await tokenType.deploy()) as MockErc20
    return { token }
}

interface TreasuryFixture {
   token: MockErc20,
   treasury: Treasury
}

interface WithdrawalAccountFixture {
    token: MockErc20,
    withdrawalAccount: WithdrawalAccount
}

export async function treasuryFixture(): Promise<TreasuryFixture> {
    const token = (await mockERC20Fixture()).token;
    const classType = await ethers.getContractFactory('Treasury')
    const treasury = await classType.deploy(token.address) as Treasury;
    return { token,  treasury}
}

export async function withdrawalAccountFixture(): Promise<WithdrawalAccountFixture> {
    const [owner, owner1] = await ethers.getSigners();
    const token = (await mockERC20Fixture()).token;
    const classType = await ethers.getContractFactory('WithdrawalAccount')

    const withdrawalAccount = await classType.deploy(token.address, owner.address) as WithdrawalAccount;
    return { token,  withdrawalAccount}
}

interface UniswapFactoryFixture {
    uniswapFactory: PancakeFactory
}

export async function uniswapFactoryFixture(): Promise<UniswapFactoryFixture> {
    const [owner, owner1] = await ethers.getSigners();
    const classType = await ethers.getContractFactory('PancakeFactory')
    let uniswapFactory = (await classType.deploy(owner.address)) as PancakeFactory
    return { uniswapFactory }
}

interface UniswapV2PairFixture {
    token0: MockErc20,
    token1: MockErc20,
    uniswapFactory: PancakeFactory
}
 
export async function uniswapV2PairFixture(uniswapFactory: PancakeFactory): Promise<UniswapV2PairFixture> {
    const [owner, owner1] = await ethers.getSigners();
    const tokenType = await ethers.getContractFactory('MockERC20')
    const token0 = (await tokenType.deploy()) as MockErc20
    const token1 = (await tokenType.deploy()) as MockErc20
    
    await uniswapFactory.createPair(token0.address, token1.address)
    return { uniswapFactory, token0, token1 }
}

interface UniswapRouterFixture {
    uniswapRouter: PancakeRouter,
    uniswapFactory: PancakeFactory
}

export async function mockUniswapRouterFixture(uniswapFactory: PancakeFactory): Promise<UniswapRouterFixture> {
    const [owner, owner1] = await ethers.getSigners();
     const classType = await ethers.getContractFactory('PancakeRouter')
     let uniswapRouter = (await classType.deploy(uniswapFactory.address, uniswapFactory.address)) as PancakeRouter
     return { uniswapFactory, uniswapRouter }
}


interface LpFarmStrategyFixture {
    lpFarmStrategy: LpFarmStrategy,
    uniswapRouter: PancakeRouter,
    uniswapFactory: PancakeFactory,
    uniswapV2Pair: PancakePair,
    token0: MockErc20,
    token1: MockErc20,
    farmToken: MockErc20
}

export async function lpFarmStrategyFixture(): Promise<LpFarmStrategyFixture> {
     const [owner, owner1] = await ethers.getSigners();
     const uniswapFactory = (await uniswapFactoryFixture()).uniswapFactory;
     const uniswapRouter = (await mockUniswapRouterFixture(uniswapFactory)).uniswapRouter;
     const uniswapV2PairFix = await uniswapV2PairFixture(uniswapFactory);
     const pair = await uniswapFactory.getPair(uniswapV2PairFix.token0.address, uniswapV2PairFix.token1.address)
     const factory = new LpFarmStrategyFactory(owner)
     const farmToken = (await mockERC20Fixture()).token
     const classType = await ethers.getContractFactory('PancakePair')
     const uniswapV2Pair = classType.attach(pair) as PancakePair;
     const farmClassType = await ethers.getContractFactory('LPFarmMock')
     const  farm = await farmClassType.deploy(pair);
     const lpFarmStrategy = await factory.deploy(pair, farmToken.address, uniswapRouter.address, farm.address, owner.address)
     const token0 = uniswapV2PairFix.token0
     const token1 = uniswapV2PairFix.token1
     return { uniswapFactory, uniswapRouter,  lpFarmStrategy, uniswapV2Pair, token0, token1, farmToken}
}

interface DispatcherFixture {
    dispatcher: Dispatcher
}

export async function dispatcherFixture(token0: MockErc20, token1: MockErc20): Promise<DispatcherFixture> {
     const classType = await ethers.getContractFactory('Dispatcher')
     const dispatcher = await classType.deploy(token0.address, token1.address) as Dispatcher;
     return { dispatcher}
}

interface OfflineInvestmentStrategyFixture {
    strategy: OfflineInvestmentStrategy
}

export async function offlineInvestmentStrategyFixture(): Promise<OfflineInvestmentStrategyFixture> {
    const [owner, owner1] = await ethers.getSigners(); 
    const classType = await ethers.getContractFactory('OfflineInvestmentStrategy')
    const strategy = await classType.deploy(owner.address) as OfflineInvestmentStrategy;
    return { strategy}
}

