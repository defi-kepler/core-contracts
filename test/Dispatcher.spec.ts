import { expect } from './shared/expect'
import { BigNumber, Wallet} from 'ethers'
import { ethers, waffle } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { lpFarmStrategyFixture, dispatcherFixture,offlineInvestmentStrategyFixture } from './shared/fixtures'
import { MockErc20 } from '../typechain/MockErc20'
import { LpFarmStrategy } from '../typechain/LpFarmStrategy'
import {PancakeFactory  } from '../typechain/PancakeFactory'
import { PancakeRouter } from '../typechain/PancakeRouter'
import {PancakePair} from '../typechain/PancakePair'
import { Dispatcher } from '../typechain/Dispatcher'
import { OfflineInvestmentStrategy } from '../typechain/OfflineInvestmentStrategy'
const createFixtureLoader = waffle.createFixtureLoader


describe("Dispatcher", () => {
    let wallet: Wallet, other: Wallet

    let loadFixture: ReturnType<typeof waffle.createFixtureLoader>
    let user:SignerWithAddress;
    let user2:SignerWithAddress;
    let token0: MockErc20;
    let token1: MockErc20;
    let lpFarmStrategy: LpFarmStrategy;
    let offlineInvestment1: OfflineInvestmentStrategy;
    let uniswapV2Factory: PancakeFactory;
    let uniswapRouter: PancakeRouter;
    let uniswapV2Pair: PancakePair;
    let dispatcher: Dispatcher;
    let FIXED_AMOUNT_OF_CHECKINS = 1e18 +"";

    before('create fixture loader', async () => {
        const [owner, owner1] = await ethers.getSigners();
        user = owner;
        user2 = owner1;
        ;[wallet, other] = await (ethers as any).getSigners()
        loadFixture = waffle.createFixtureLoader([wallet, other])
    })
    let num = BigNumber.from('10000000000000000000000000000000000');
    beforeEach('deploy LPFarmStrategy', async () => {
        let fixture = await loadFixture(lpFarmStrategyFixture);
        lpFarmStrategy = fixture.lpFarmStrategy;
        uniswapV2Factory = fixture.uniswapFactory;
        uniswapRouter = fixture.uniswapRouter;
        uniswapV2Pair = fixture.uniswapV2Pair;
        token0 = fixture.token0
        token1 = fixture.token1
        let fixture1 = await dispatcherFixture(token0, token1);
        dispatcher = fixture1.dispatcher;
        let fixture2 = await offlineInvestmentStrategyFixture()
        offlineInvestment1 = fixture2.strategy;
        await token0.mint(user.address, num)
        await token1.mint(user.address, num)
        let now = (new Date().getTime()/ 1000).toFixed() + 300;
        await token0.approve(uniswapRouter.address, num);
        await token1.approve(uniswapRouter.address, num);
        let hash = await uniswapV2Factory.getInitHash()
        await uniswapRouter.addLiquidity(token0.address, token1.address, BigNumber.from("1000000"), BigNumber.from("1000000"), 0, 0, user.address, now)
        await lpFarmStrategy.initApprove();
        await lpFarmStrategy.setOperator(dispatcher.address, true);
        await lpFarmStrategy.setDispatcher(dispatcher.address);
        await offlineInvestment1.setDispatcher(dispatcher.address);
        await offlineInvestment1.setOperator(dispatcher.address, true);

    });

    it('add pool', async () => {
       await dispatcher.addStrategys(lpFarmStrategy.address, 10)
       expect(await dispatcher.tokenPoint()).to.be.eq(10);
    })

    it('test lpFarmStrategy ', async () => {
        let totalSupply0 = await uniswapV2Pair.totalSupply();
        await dispatcher.addStrategys(lpFarmStrategy.address, 10)
        await token0.mint(dispatcher.address, 1000000)
        await token1.mint(dispatcher.address, 1000000)
        await dispatcher.dispatch();
        await dispatcher.execute(0);
        let totalSupply1 = await uniswapV2Pair.totalSupply();
       
        expect(totalSupply1).to.be.gt(totalSupply0)
     })

     it('test lpFarmStrategy and  offlineInvestment', async () => {
        await dispatcher.addStrategys(offlineInvestment1.address, 10)
        await dispatcher.addStrategys(lpFarmStrategy.address, 10)
        await token0.mint(dispatcher.address, 2000000)
        await token1.mint(dispatcher.address, 2000000)
        await dispatcher.dispatch();
        await dispatcher.execute(0)
        await dispatcher.execute(1)
        await offlineInvestment1.receiveFunds(token0.address, user2.address, 1000000)
        await offlineInvestment1.receiveFunds(token1.address, user2.address, 1000000)
        expect(await token0.balanceOf(user2.address)).to.be.eq(1000000)
        expect(await token1.balanceOf(user2.address)).to.be.eq(1000000)
        expect(await token1.balanceOf(dispatcher.address)).to.be.eq(0)
      
     })

     it('test lpFarmStrategy and  offlineInvestment2', async () => {
        await dispatcher.addStrategys(offlineInvestment1.address, 10)
        await dispatcher.addStrategys(lpFarmStrategy.address, 10)
        await dispatcher.updateStrategys(1, 0)
        await token0.mint(dispatcher.address, 2000000)
        await token1.mint(dispatcher.address, 2000000)
        await dispatcher.dispatch();
        await dispatcher.execute(0)
        //await dispatcher.execute(1)
        await offlineInvestment1.receiveFunds(token0.address, user2.address, 2000000)
        await offlineInvestment1.receiveFunds(token1.address, user2.address, 2000000)
        expect(await token0.balanceOf(user2.address)).to.be.eq(2000000)
        expect(await token1.balanceOf(user2.address)).to.be.eq(2000000)
        expect(await token1.balanceOf(dispatcher.address)).to.be.eq(0)
      
     })

     it('test  offlineInvestment', async () => {
        await dispatcher.addStrategys(offlineInvestment1.address, 10)
        await token0.mint(dispatcher.address, 1000000)
        await token1.mint(dispatcher.address, 1000000)
        await dispatcher.dispatch();
        await dispatcher.execute(0)
        await offlineInvestment1.receiveFunds(token0.address, user2.address, 1000000)
        await offlineInvestment1.receiveFunds(token1.address, user2.address, 1000000)
        expect(await token0.balanceOf(user2.address)).to.be.eq(1000000)
        expect(await token1.balanceOf(user2.address)).to.be.eq(1000000)

     })

    

   

    
    
})