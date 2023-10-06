import { ethers } from 'ethers';
import { useState } from 'react';
import { deploy, escrowContract } from './deploy';
import Escrow from './Escrow';


const provider = new ethers.providers.Web3Provider(window.ethereum);

const server = "http://localhost:3001/";

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();


  async function connectWallet() {
    const accounts = await provider.send('eth_requestAccounts', []);

    setAccount(accounts[0]);
    setSigner(provider.getSigner());
  }


  async function getDeployedContract() {
    const res = await fetch(server + 'contracts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    setContracts(await res.json());
  }

  const onSelectContract = async (event) => {
    event.preventDefault();
    const address = event.target.value;
    setSelectedContract(address);
    const ec = await escrowContract(address, provider);
    const escrow = {
      address: address,
      arbiter: await ec.arbiter(),
      beneficiary: await ec.beneficiary(),
      value: ethers.utils.formatUnits(await provider.getBalance(address), 18),
      handleApprove: async () => {
        ec.on('Approved', () => {
          document.getElementById(address).className =
            'complete';
          document.getElementById(address).innerText =
            "✓ It's been approved!";
        });
        await approve(ec, signer);
      },
    };
    setEscrow(escrow);
  };

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.utils.parseUnits(document.getElementById('eth').value || "0", 18);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);

    await fetch(server + 'contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contract: escrowContract.address }),
    })


  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>

        {account ? <label>
          Deposit Address
          <input type="text" id="depositor" value={account} disabled />
        </label> :
          <div
            className="button"
            id="deploy" onClick={connectWallet}>Connect
          </div>
        }

        <label>
          Arbiter Address
          <input type="text" id="arbiter" defaultValue="0x70997970C51812dc3A010C7d01b50e0d17dc79C8" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" defaultValue="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" />
        </label>

        <label>
          Deposit Amount (in ETH)
          <input type="text" id="eth" />
        </label>

        <div
          className="button"
          id="deploy"
          disabled={!account}
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div
          className="button"
          id="refresh"
          onClick={(e) => {
            e.preventDefault();

            getDeployedContract();
          }}
        >
          Refresh
        </div>

        <div>
          <label>Select a Contract:</label>
          <select onChange={onSelectContract} >
            <option value="0">Select...</option>
            {contracts.map((contract, index) => (
              <option key={index} value={contract}>
                {contract}
              </option>
            ))}
          </select>
        </div>

        {escrow ?
          <div id="container">
            <Escrow key={escrow.address} {...escrow} account={account} />
          </div> : <></>
        }
      </div>
    </>
  );
}

export default App;
