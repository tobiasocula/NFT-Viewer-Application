import './App.css'
import { useMyContext } from './context';
import {ethers} from 'ethers';

const resolveIpfsUrl = (url) => {
  console.log('url:', url);
  if (!url) return null;
  if (url.startsWith("ipfs://")) {
    const cid = url.replace("ipfs://", "");
    console.log('returning:', `https://ipfs.io/ipfs/${cid}`)
    return `https://ipfs.io/ipfs/${cid}`;
  }
  return url;
}



function App() {

  const {accounts, addAccount, setData, removeAccount, setAccountState, setAccAddress, setAccountCollapse} = useMyContext();

  //const checkCollapsed = (accIndex, nftIndex) => accounts[accIndex].data[nftIndex].collapsed;

  const findAccIndex = (id) => {
        for (let i=0; i<accounts.length; i++) {
            if (accounts[i].id === id) {
                return i;
            }
        }
    }

  console.log('accounts:', accounts);

  return (
    <>
      <h1 className='title'>Welcome</h1>

      <div className='accounts'>
        {accounts.map((acc) => (
          <div className='account' key={acc.id}>

            {accounts.length > 1 && (
              <div className='remove-acc-container'>
              <div className='remove-account' onClick={() => removeAccount(findAccIndex(acc.id))}>
                Remove
            </div>
            </div>
            )}
            

            <div className='acc-title'>Address</div>
            <form className='form' onSubmit={async (e) => {
                  e.preventDefault();
                  const index = findAccIndex(acc.id);
                  if (!ethers.isAddress(accounts[index].address)) {
                    console.log('no valid address');
                    setAccountState(index, 2)
                  } else if (!await setData(index, acc.address)) {
                    setAccountState(index, 3)
                  }
                }}>
              <input className='input' type="text" value={acc.address} onChange={
                (e) => {
                  setAccAddress(findAccIndex(acc.id), e.target.value);
                }
              }></input>
              <button className='form-button' type="submit">Search</button>
            </form>
            
         
         <div className='acc-data'>
              {acc.status === 4 ? (
                <div className='acc-loaded-data'>
                  Data:

                  
                    {[...Array(acc.data.length).keys()].map(id => (

                          acc.data[id].collapsed ? (

                            <div className='collapse-section1' onClick={(e) => {
                            e.preventDefault();
                            const idx = findAccIndex(acc.id);
                            setAccountCollapse(idx, id, false)
                          }}>{acc.data[id].name}
                            </div>
                          ) : (

                      <div className='collapse-section2' onClick={(e) => {
                            e.preventDefault();
                            const idx = findAccIndex(acc.id);
                            setAccountCollapse(idx, id, true)
                          }}>
                          <div className='token-data-section'>
                        <div className='bold-text'>
                          Address: 
                        </div>
                        <div className='normal-text'>
                          {acc.data[id].address}
                        </div>
                      </div>

                        <div className='token-data-section'>
                        <div className='bold-text'>
                          Token Type: 
                        </div>
                        <div className='normal-text'>
                          {acc.data[id].tokenType}
                        </div>
                      </div>

                      <div className='token-data-section'>
                        <div className='bold-text'>
                          Name: 
                        </div>
                        <div className='normal-text'>
                          {acc.data[id].name}
                        </div>
                      </div>

                      <div className='token-data-section'>
                        <div className='bold-text'>
                          Symbol: 
                        </div>
                        <div className='normal-text'>
                          {acc.data[id].symbol}
                        </div>
                      </div>

                      <div className='token-data-section'>
                        <div className='bold-text'>
                          Token type: 
                        </div>
                        <div className='normal-text'>
                          {acc.data[id].tokenType}
                        </div>
                      </div>

                      <div className='token-data-section'>
                        <div className='bold-text'>
                          Description: 
                        </div>
                        <div className='normal-text'>
                          {acc.data[id].description || "Not provided"}
                        </div>

                        </div>

                            <img src={resolveIpfsUrl(acc.data[id].image)} alt="NFT image" className='nft-img'/>
                            {/* <p>Resolved URL: {resolveIpfsUrl(acc.data[id].image)}</p> */}

                      </div>
                          )
                          
                        ))}
                        </div>
                      ) : (
                        <div className='text'>
                        {acc.status === 1
                          ? "Loading..."
                          : acc.status === 2
                            ? "Incorrect address!"
                            : acc.status === 3 ? "Something went wrong." : "Nothing here yet"
                        }
                      </div>
                      )}
                      
                      </div>
                      </div>
         ))
      }
          
        <div className='add-account'>
          <img className='add-acc-button' src='/plus.png' onClick={addAccount} alt="plus image"/>
        </div>
          
          
          </div>
   
        
    </>
  )
}

export default App

   
