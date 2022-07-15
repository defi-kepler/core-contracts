import { expect } from './shared/expect'
import { BigNumber, Wallet} from 'ethers'
import { ethers, waffle } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {  dispatcherFixture } from './shared/fixtures'
import { MockErc20 } from '../typechain/MockErc20'
import { LpFarmStrategy } from '../typechain/LpFarmStrategy'
import { ChainBridgeStrategy } from '../typechain/ChainBridgeStrategy'
import { LpFarmMock } from '../typechain/LpFarmMock'
import { Treasury } from '../typechain/Treasury'
import { WithdrawalAccount } from '../typechain/WithdrawalAccount'
import { PancakeRouter } from '../typechain/PancakeRouter'
import {PancakePair} from '../typechain/PancakePair'
import { Dispatcher } from '../typechain/Dispatcher'

const createFixtureLoader = waffle.createFixtureLoader


describe("Dispatcher", () => {
    let wallet: Wallet, other: Wallet

    let loadFixture: ReturnType<typeof waffle.createFixtureLoader>
    let user:SignerWithAddress;
    let user2:SignerWithAddress;
    let token0: MockErc20;
    let token1: MockErc20;
    let lpFarmStrategy: LpFarmStrategy;
    let chainBridgeStrategy: ChainBridgeStrategy;
    let withdrawalAccount: WithdrawalAccount;
    let treasury: Treasury;
    let pancakeRouter: PancakeRouter;
    let pancakePair: PancakePair;
    let dispatcher: Dispatcher;
    let farm: LpFarmMock;
    let FIXED_AMOUNT_OF_CHECKINS = 1e18 +"";

    before('create fixture loader', async () => {
        const [owner, owner1] = await ethers.getSigners();
        user = owner;
        user2 = owner1;
        ;[wallet, other] = await (ethers as any).getSigners()
        loadFixture = waffle.createFixtureLoader([wallet, other])
    })
    let num = BigNumber.from('10000000000000000000000000000000000');
    let one = BigNumber.from('1000000000000000000');
    beforeEach('deploy LPFarmStrategy', async () => {
        let fixture = await loadFixture(dispatcherFixture);
        lpFarmStrategy = fixture.lpFarmStrategy;
        withdrawalAccount = fixture.withdrawalAccount;
        chainBridgeStrategy = fixture.chainBridgeStrategy;
        treasury = fixture.treasury;
        token0 = fixture.token0
        token1 = fixture.token1
        dispatcher = fixture.dispatcher;
        pancakeRouter = fixture.pancakeRouter
        pancakePair = fixture.pancakePair
        farm = fixture.farm;
        await token0.mint(user.address, num)
        await token1.mint(user.address, num)
        let now = (new Date().getTime()/ 1000).toFixed() + 300;
        await token0.approve(pancakeRouter.address, num);
        await token1.approve(pancakeRouter.address, num);
        await pancakeRouter.addLiquidity(token0.address, token1.address, one.mul(100), one.mul(100), 0, 0, user.address, now)
        await lpFarmStrategy.initApprove();
        
    });

    it('test treasuryWithdraw', async () => {
      const three = one.mul(3)
       await token0.approve(treasury.address, three)
       await treasury.deposit(three);
       expect(await token0.balanceOf(treasury.address)).to.be.eq(three)
       await dispatcher.treasuryWithdraw(treasury.address)
       expect(await token0.balanceOf(dispatcher.address)).to.be.eq(three)
    })

    it('test dispatch', async () => {
      const three = one.mul(3)
      await token0.approve(treasury.address, three)
      await treasury.deposit(three);
      await dispatcher.treasuryWithdraw(treasury.address)
      await dispatcher.dispatch()

      expect(await token0.balanceOf(withdrawalAccount.address)).to.be.eq(one)
      expect(await token0.balanceOf(chainBridgeStrategy.address)).to.be.eq(one)
      expect(await pancakePair.balanceOf(farm.address)).to.be.gt(0)
     })

     it('test strategyWithdraw', async ()=> {
         const three = one.mul(5)
         await token0.approve(treasury.address, three)
         await treasury.deposit(three);
         await dispatcher.treasuryWithdrawAndDispatch(treasury.address)

         let amount0 = await dispatcher.receiverTotalAmount(0)
         await dispatcher.receiverWithdraw(0, amount0);
         let amount1 = await dispatcher.receiverTotalAmount(1)
         await dispatcher.receiverWithdraw(1, amount1);
         let amount2 = await dispatcher.receiverTotalAmount(2)
         await dispatcher.receiverWithdraw(2, amount2);
         expect(await pancakePair.balanceOf(farm.address)).to.be.eq(0)
         expect(await token0.balanceOf(withdrawalAccount.address)).to.be.eq(0)
         expect(await token0.balanceOf(chainBridgeStrategy.address)).to.be.eq(0)
     })

     it('test receiverHarvest', async ()=> {
      const three = one.mul(3)
      await token0.approve(treasury.address, three)
      await treasury.deposit(three);
      await dispatcher.treasuryWithdrawAndDispatch(treasury.address)

      let amount0 = await dispatcher.receiverTotalAmount(0)
      await dispatcher.receiverHarvest(0);
      let amount1 = await dispatcher.receiverTotalAmount(1)
      await dispatcher.receiverHarvest(1);
      let amount2 = await dispatcher.receiverTotalAmount(2)
      await dispatcher.receiverHarvest(2);
      expect(await pancakePair.balanceOf(farm.address)).to.be.gt(0)
      expect(await token0.balanceOf(withdrawalAccount.address)).to.be.eq(0)
      expect(await token0.balanceOf(chainBridgeStrategy.address)).to.be.eq(0)
  })

  it('test setPuppetOperator', async ()=> {
      await dispatcher.setPuppetOperator(treasury.address, user2.address, true)
      await dispatcher.setPuppetOperator(lpFarmStrategy.address, user2.address, true)
      await dispatcher.setPuppetOperator(chainBridgeStrategy.address, user2.address, true)
      await dispatcher.setPuppetOperator(withdrawalAccount.address, user2.address, true)
   })

   it('test chainBridgeToWithdrawalAccount', async ()=> {
      const three = one.mul(3)
      await token0.approve(treasury.address, three)
      await treasury.deposit(three);
      await dispatcher.treasuryWithdrawAndDispatch(treasury.address)
      await dispatcher.setPercentageToWithdrawalAccount(5000)
      await dispatcher.chainBridgeToWithdrawalAccount(1, token0.address, withdrawalAccount.address);
      expect(await token0.balanceOf(withdrawalAccount.address)).to.be.eq(one.div(2).add(one))
   })
})