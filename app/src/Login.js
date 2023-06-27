
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import contractABI from './json/Glo_NFT.json';

const contractAddress = '0xC7D3bd1819538aD520e07F57Fd47507B47E48C16';


function Login() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState();
    const [nftInfo, setNftInfo] = useState();

    useEffect(() => {
        if (account !== '' && web3) {
            const cont = new web3.eth.Contract(contractABI.abi, contractAddress);
            setContract(cont)
        }
    }, [account, web3])

    useEffect(() => {
        const getIdZero = async () => {
            const id = await contract.methods.getTotalIds().call()
            const creator = await contract.methods.getCreator(id).call()
            const currSupp = await contract.methods.getCurrentSupply(id).call()
            const maxSupp = await contract.methods.getMaxSupply(id).call()

            setNftInfo({ creator, currSupp, maxSupp })
        }

        if (contract) getIdZero()
    }, [contract])

    const handleInit = async () => {
        await contract.methods.initNFT(100, web3.utils.toWei('0.0001', 'ether')).send({
            from: account,
            gasPrice: web3.utils.toWei('10', 'gwei')
        })
    }

    const handleMinting = async () => {
        await contract.methods.mint(1, 1).send({
            from: account,
            value: web3.utils.toWei('0.0001', 'ether'),
            gasPrice: web3.utils.toWei('1', 'gwei')
        })
    }

    const loadWeb3 = async () => {
        if (window.ethereum) {
            // Enable Web3
            await window.ethereum.enable();
            const web3 = new Web3(window.ethereum);
            setWeb3(web3);
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0] || '');
        }
    };

    useEffect(() => {
        loadWeb3();
    }, []);

    const handleLogin = () => {
        if (web3) {
            // Perform any required authentication logic
            console.log(`Logged in with account: ${account}`);
        } else {
            console.log('Web3 not available');
        }
    };

    return (
        <div>

            <p>Connected Account: {account}</p>
            <button onClick={handleLogin}>{account === '' ? "Login" : "Logout"}</button>

            <button onClick={handleInit} >Init an NFT</button>

            {nftInfo && <div>
                <h1>Creator {nftInfo.creator}</h1>
                <h1>Current Supply {nftInfo.currSupp.toString()}</h1>
                <h1>Max Supply {nftInfo.maxSupp.toString()}</h1>
            </div>}

            <button onClick={handleMinting}>
                Mint
            </button>
        </div>
    );
}

export default Login;