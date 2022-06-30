import {ethers, Wallet, utils} from "ethers"
import axios from 'axios';
import Web3 from "web3"
import {Accounts} from "web3-eth-accounts"
import Eth from "web3-eth"
async function main() {
    var mnemonic = "hint discover alarm energy symbol little elegant opinion employ announce verify confirm"
    var walletMnemonic = Wallet.fromMnemonic(mnemonic)
 
    var str = "a"
    console.info(str)
    console.info("hash" + utils.hashMessage(str))
    let result = await walletMnemonic.signMessage(str)
    console.info(result)
    console.info("------------")

    web3main()
    
}

async function web3main() {
  let web3 = new Web3('https://bsc.getblock.io/testnet/?api_key=a2205193-8298-44d2-936f-666872bf2e98')

  let signMsg = web3.eth.accounts.sign("a",'3e13561babee3d81ab65416bf5a06697b00b48376aa091b2ad43a3ede4dddf34');
  console.info("hash:" + signMsg.messageHash)
  console.info("signature:" + signMsg.signature)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


