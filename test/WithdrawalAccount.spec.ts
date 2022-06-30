import { expect } from './shared/expect'
import { BigNumber, Wallet} from 'ethers'
import { ethers, waffle } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { withdrawalAccountFixture } from './shared/fixtures'
import { MockErc20 } from '../typechain/MockErc20'
import { WithdrawalAccount } from '../typechain/WithdrawalAccount'
const createFixtureLoader = waffle.createFixtureLoader
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

describe("WithdrawalAccount", () => {
    let wallet: Wallet, other: Wallet

    let loadFixture: ReturnType<typeof waffle.createFixtureLoader>
    let user:SignerWithAddress;
    let user2:SignerWithAddress;
    let token: MockErc20;
    let withdrawalAccount: WithdrawalAccount;
    let FIXED_AMOUNT_OF_CHECKINS = 10 * 10**18;

    before('create fixture loader', async () => {
        const [owner, owner1] = await ethers.getSigners();
        user = owner;
        user2 = owner1;
        ;[wallet, other] = await (ethers as any).getSigners()
        loadFixture = waffle.createFixtureLoader([wallet, other])
    })

    beforeEach('deploy WithdrawalAccount', async () => {
        let fixture = await loadFixture(withdrawalAccountFixture);
        token = fixture.token;
        withdrawalAccount = fixture.withdrawalAccount;
        await token.mint(withdrawalAccount.address, 10000000000)
        await token.mint(user.address, 20000000000)
        await token.approve(withdrawalAccount.address, 20000000000);
    });


    it('deposit test', async () => {
      await withdrawalAccount.withdrawal(user.address, 10000000000);
      expect(await token.balanceOf(withdrawalAccount.address)).to.be.eq(0);
      expect(await token.balanceOf(user.address)).to.be.eq(30000000000);
    })

    it('deposit test 1', async () => {
        await withdrawalAccount.withdrawal(user2.address, 20000000000);
        expect(await token.balanceOf(user.address)).to.be.eq(0);
        expect(await token.balanceOf(withdrawalAccount.address)).to.be.eq(10000000000);
      })


})