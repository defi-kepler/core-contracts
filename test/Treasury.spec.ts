import { expect } from './shared/expect'
import { BigNumber, Wallet} from 'ethers'
import { ethers, waffle } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { treasuryFixture } from './shared/fixtures'
import { MockErc20 } from '../typechain/MockErc20'
import { Treasury } from '../typechain/Treasury'
const createFixtureLoader = waffle.createFixtureLoader
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

describe("Treasury", () => {
    let wallet: Wallet, other: Wallet

    let loadFixture: ReturnType<typeof waffle.createFixtureLoader>
    let user:SignerWithAddress;
    let user2:SignerWithAddress;
    let token: MockErc20;
    let treasury: Treasury;
    let FIXED_AMOUNT_OF_CHECKINS = 10 * 10**18;

    before('create fixture loader', async () => {
        const [owner, owner1] = await ethers.getSigners();
        user = owner;
        user2 = owner1;
        ;[wallet, other] = await (ethers as any).getSigners()
        loadFixture = waffle.createFixtureLoader([wallet, other])
    })

    beforeEach('deploy Treasury', async () => {
        let fixture = await loadFixture(treasuryFixture);
        token = fixture.token;
        treasury = fixture.treasury;
        await token.mint(user.address, 10000000000)
        await token.approve(treasury.address, 10000000000);
    });


    it('deposit test', async () => {
      await treasury.deposit(10000000000);
      expect(await token.balanceOf(user.address)).to.be.eq(0);
   
    })

    it('withdraw test', async () => {
        await treasury.deposit(10000000000);
        await treasury.withdraw(user2.address);
        expect(await token.balanceOf(user2.address)).to.be.eq(10000000000);
      })


})