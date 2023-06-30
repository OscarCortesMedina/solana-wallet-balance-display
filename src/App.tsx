import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton,WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { FC, ReactNode, useMemo, useCallback, useEffect, useState } from 'react';
import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
    return (
        <Context>
            <Contents/>
        </Context>
    );
};
export default App;

// Creating App context
const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network in this case 'devnet'
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new SolflareWalletAdapter()
        ],
        [network]
    );

    // return the wallet provider
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

// Creating App contents
const Contents: FC = () => {
  // Get the wallet from the context
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>();

  // Get the balance of the wallet
  const getBalance = useCallback(async () => {
    if (!publicKey) return;
    try{
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const balance = await connection.getBalance(publicKey);
    setBalance(balance / 1e9);
    } catch (err) {
      console.log(err);
      setBalance(null);
    }
    
  }, [publicKey]);

  // Get the balance once when connecting
  useEffect(() => {
    if (!connected) {
      setBalance(undefined);
      return;
    }
    getBalance();
  }, [connected, getBalance]);

  // Get the balance whenever the user changes wallets
    return (
      <div className="App">
        <div className='container'>
          <Layout className='layout'>
              <Header className='header'>
                  <Title level={2} style={{ color: 'white' }}>
                      Solana Wallet Adapter (devnet)
                  </Title>
              </Header>
              <Content className='content' >
                  {!connected && <WalletMultiButton />}
                  {connected && <WalletDisconnectButton />}
                  {connected && <Title style={{ color: 'white' }} level={3}>
                      Balance: 
                      { balance !== undefined && balance !== null ? 
                      `${balance} SOL` : 'Loading...'} 
                      {balance === null && "Error connecting or getting wallet balance"}
                      </Title>}
              </Content>
          </Layout>
        </div>
    </div>
    );
};
