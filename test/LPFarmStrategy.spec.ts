import { expect } from './shared/expect'
import { BigNumber, Wallet} from 'ethers'
import { ethers, waffle } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { lpFarmStrategyFixture, mockUniswapRouterFixture } from './shared/fixtures'
import { MockErc20 } from '../typechain/MockErc20'
import { LpFarmStrategy } from '../typechain/LpFarmStrategy'
import {PancakeFactory  } from '../typechain/PancakeFactory'
import { PancakeRouter } from '../typechain/PancakeRouter'
import {PancakePair} from '../typechain/PancakePair'
const createFixtureLoader = waffle.createFixtureLoader
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

describe("LPFarmStrategy", () => {
    let wallet: Wallet, other: Wallet

    let loadFixture: ReturnType<typeof waffle.createFixtureLoader>
    let user:SignerWithAddress;
    let user2:SignerWithAddress;
    let token0: MockErc20;
    let token1: MockErc20;
    let lpFarmStrategy: LpFarmStrategy;
    let uniswapV2Factory: PancakeFactory;
    let uniswapRouter: PancakeRouter;
    let uniswapV2Pair: PancakePair;

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
        console.info(`token0 = ${token0.address} token1 = ${token1.address}`)
        console.info(`uniswapV2Pair = ${uniswapV2Pair.address} `)
        await token0.mint(user.address, num)
        await token1.mint(user.address, num)
        let now = (new Date().getTime()/ 1000).toFixed() + 300;
        console.info(await uniswapRouter.factory())
        await token0.approve(uniswapRouter.address, num);
        await token1.approve(uniswapRouter.address, num);
        let hash = await uniswapV2Factory.getInitHash()
        await uniswapRouter.addLiquidity(token0.address, token1.address, BigNumber.from("1000000"), BigNumber.from("1000000"), 0, 0, user.address, now)
        await lpFarmStrategy.initApprove();
    });


    it('one executeStrategy test', async () => {
        let totalSupply = await uniswapV2Pair.totalSupply();
        console.info(`totalSupply = ${totalSupply}`)
        await token0.approve(lpFarmStrategy.address, BigNumber.from(1000000))
        await token1.approve(lpFarmStrategy.address, BigNumber.from(1000000))
        await lpFarmStrategy.executeStrategy()
        totalSupply = await uniswapV2Pair.totalSupply();
        expect(totalSupply).to.be.eq(2000000);
        let now = (new Date().getTime()/ 1000).toFixed() + 300;
        console.info(`totalSupply = ${totalSupply}`)
        let balanceA = await token0.balanceOf(lpFarmStrategy.address);
        let balanceB = await token1.balanceOf(lpFarmStrategy.address);
        console.info(`balanceA = ${balanceA}  balanceB = ${balanceB}`)
    })

    it('twice executeStrategy test', async () => {
        let totalSupply = await uniswapV2Pair.totalSupply();
      
        await token0.approve(lpFarmStrategy.address, BigNumber.from(1000000))
        await token1.approve(lpFarmStrategy.address, BigNumber.from(1000000))
        await lpFarmStrategy.executeStrategy()
        totalSupply = await uniswapV2Pair.totalSupply();
        expect(totalSupply).to.be.eq(2000000);
        console.info(`totalSupply = ${totalSupply}`)
        await token0.approve(lpFarmStrategy.address, BigNumber.from("300000000000000000000"))
        await token1.approve(lpFarmStrategy.address, BigNumber.from("100000000000000000000"))
        await lpFarmStrategy.executeStrategy()
        let balanceA = await token0.balanceOf(lpFarmStrategy.address);
        let balanceB = await token1.balanceOf(lpFarmStrategy.address);
        console.info(`balanceA = ${balanceA}  balanceB = ${balanceB}`)
    })

    it('harvest test', async () => {
        let totalSupply = await uniswapV2Pair.totalSupply();
        console.info(`totalSupply = ${totalSupply}`)
        await token0.approve(lpFarmStrategy.address, BigNumber.from("300000000000000000000"))
        await token1.approve(lpFarmStrategy.address, BigNumber.from("100000000000000000000"))
        await lpFarmStrategy.executeStrategy()
        totalSupply = await uniswapV2Pair.totalSupply();
        await lpFarmStrategy.harvest();
    })

    it('withdraw test', async () => {
        
   
        await token0.transfer(lpFarmStrategy.address, BigNumber.from("100000000000000000000"))
        await token1.transfer(lpFarmStrategy.address, BigNumber.from("100000000000000000000"))
        await lpFarmStrategy.executeStrategy()
        await lpFarmStrategy.withdraw(45)
        let balanceA = await token0.balanceOf(user.address);
        let balanceB = await token1.balanceOf(user.address);
        console.info(`balanceA = ${balanceA}  balanceB = ${balanceB}`)
    })


})