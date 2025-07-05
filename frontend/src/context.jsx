import { createContext, useState, useContext, useEffect } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';

const Context = createContext();

export const useMyContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {

    
    // status:
    // 0 -> not fetched yet
    // 1 -> loading
    // 2 -> incorrect address
    // 3 -> error ocurred
    // 4 -> success

    const [accounts, setAccounts] = useState([{
        address: "",
        id: 0,
        data: [],
        status: 0
    }]);

    useEffect(() => {
        const storedAccounts = localStorage.getItem("accounts")
        if (storedAccounts) {setAccounts(JSON.parse(storedAccounts))}
    }, []);

    useEffect(() => {
        // every time the favourites change -> update local storage
        // JSON.stringify = inverse operation of JSON.parse
        localStorage.setItem('accounts', JSON.stringify(accounts))
    }, [accounts]);

    const setAccountState = (index, status) => {
        setAccounts((prev) => [...prev.slice(0, index), {
            address: prev[index].address,
            id: prev[index].id,
            data: prev[index].data,
            status: status
        },
        ...prev.slice(index+1)]);
    }
    const setAccountCollapse = (accIndex, nftIndex, state) => {
        
        setAccounts((prev) => [...prev.slice(0,accIndex), {
            address: prev[accIndex].address,
            id: prev[accIndex].id,
            data: [...prev[accIndex].data.slice(0,nftIndex), {
                address: prev[accIndex].data[nftIndex].address,
                name: prev[accIndex].data[nftIndex].name,
                symbol: prev[accIndex].data[nftIndex].symbol,
                tokenType: prev[accIndex].data[nftIndex].tokenType,
                image: prev[accIndex].data[nftIndex].image,
                description: prev[accIndex].data[nftIndex].description,
                collapsed: state
            }, ...prev[accIndex].data.slice(nftIndex+1)],
            status: prev[accIndex].status,
        }, ...prev.slice(accIndex+1)]);
        
    }

    const addAccount = () => {
        setAccounts((prev) => [...prev, {
            address: "",
            id: prev[prev.length-1].id+1,
            data: null,
            status: 0
        }]);
    }
    const removeAccount = (index) => {
        setAccounts((prev) => [
            ...prev.slice(0,index),
            ...prev.slice(index+1,prev.length)
        ]);
    }
    const setAccAddress = (index, addr) => {
        setAccounts((prev) => [...prev.slice(0,index), {
            address: addr,
            id: prev[index].id,
            data: prev[index].data,
            status: prev[index].status,
        }, ...prev.slice(index+1)]);
    }
    const setAccData = (index, data) => {
        setAccounts((prev) => [...prev.slice(0,index), {
            address: prev[index].address,
            id: prev[index].id,
            data: data,
            status: prev[index].status,
        }, ...prev.slice(index+1)]);
    }

    const setData = async (index, addr) => {
        console.log('setdata called');
        setAccountState(index, 1);
        try {
            const config = {
            apiKey: 'YNaf7MtOQ7bue4DBaeY8hBkuroqOc_c7',
            network: Network.ETH_SEPOLIA,
            };
            

            const alchemy = new Alchemy(config);
            console.log(`Fetching NFTs for address: ${addr}`);

            const response = await alchemy.nft.getNftsForOwner(addr);
            let ownedNfts = response.ownedNfts;

            if (!ownedNfts.length) {
            console.log(`No NFTs found for address ${addr}`);
            return;
            }
            if (ownedNfts.length > 5) {
                ownedNfts = ownedNfts.slice(0,5);
            }


            console.log('ownedNFTs:', ownedNfts);

            const metadataPromises = ownedNfts.map(nft => alchemy.nft.getNftMetadata(
                    nft.contract.address, nft.tokenId
                ));
            console.log('fetched metadata promises');
            const metadata = await Promise.all(metadataPromises);
            console.log('metadata:', metadata);
            //console.log('raw metadata:', metadata[0].raw.metadata);

            //console.log('wanted url:', metadata[0].raw.metadata.image);

            const data = [...Array(metadata.length).keys()].map(datafield_id => ({
                    address: metadata[datafield_id].contract.address,
                    name: metadata[datafield_id].contract.name,
                    symbol: metadata[datafield_id].contract.symbol,
                    tokenType: metadata[datafield_id].contract.tokenType,
                    image: metadata[datafield_id].image.cachedUrl,
                    description: metadata[datafield_id].description,
                    collapsed: true
                    })
                );

                console.log('data:', data);

                setAccData(index, data);
                console.log('account data:', accounts[index].data);
                setAccountState(index, 4);
            //console.log('image url:', metadata[id].image.cachedUrl);
            return true;

            


} catch (e) {
    console.log('error:', e);
    return false;
}
    }

    const value = {
        accounts, addAccount, setData, removeAccount, setAccountState, setAccAddress, setAccountCollapse
    }
    return (
        <Context.Provider value={value}>{children}</Context.Provider>
    )

}
