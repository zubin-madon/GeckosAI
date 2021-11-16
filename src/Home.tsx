import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";

import purpleSpace from "./pink_space.jpg";
import blueSpace from "./blue_space.jpg";
import firstGecko from './Gecko46.jpg';
import secondGecko from './Gecko567.jpg';
import thirdGecko from './Gecko600.jpg';
import fourthGecko from './Geckos24.jpg';
import fifthGecko from './Geckos170.jpg';

const ConnectButton = styled(WalletDialogButton)``;

const CounterText = styled.span``; // add your styles here

// const MintContainer = styled.div``; // add your styles here

// const MintButton = styled(Button)``; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const {
        candyMachine,
        goLiveDate,
        itemsAvailable,
        itemsRemaining,
        itemsRedeemed,
      } = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      setItemsAvailable(itemsAvailable);
      setItemsRemaining(itemsRemaining);
      setItemsRedeemed(itemsRedeemed);

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
      refreshCandyMachineState();
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);

  const contentModal = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loreEl = useRef<HTMLDivElement>(null);
  const roadmapEl = useRef<HTMLDivElement>(null);
  const marketsEl = useRef<HTMLDivElement>(null);
  const contactEl = useRef<HTMLDivElement>(null);

  return (
    <div
      className="bg-black flex flex-col min-h-screen w-full"
    >
      <div
        className="bg-black h-screen bg-opacity-80 w-screen transition-opacity z-50 duration-300 absolute overflow-y-scroll"
        style={{
          backdropFilter: 'blur(10px)',
          opacity: modalOpen ? 1 : 0,
          pointerEvents: modalOpen ? 'all' : 'none'
        }}
        ref={contentModal}
      >
        <button
          className="bg-white rounded-full flex h-12 text-black top-10 left-10 w-12 fixed items-center justify-center hover:(text-white bg-gray-800) "
          onClick={() => setModalOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex flex-col h-full w-full p-10 justify-center items-center">
          <div>
            {wallet ? (
              <button
                className="bg-white border-black rounded-none flex font-semibold border-2 mt-10 text-sm text-black py-3 px-5 z-50 items-center  md:right-15 hover:(bg-black text-white border-white) disabled:(bg-gray-300 text-black border-black) "
                style={{
                  boxShadow: '6px 6px 0 0 black',
                }}
                disabled={isSoldOut || isMinting || !isActive}
                onClick={onMint}
              >
                {isSoldOut ? (
                  'SOLD OUT'
                ) : (
                  isActive ? (
                    isMinting ? (
                      <CircularProgress />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 mr-3 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        MINT A GECKO
                      </>
                    )
                  ) : (
                    <Countdown
                      date={startDate}
                      onMount={({ completed }) => setIsActive(completed)}
                      onComplete={() => setIsActive(true)}
                      renderer={renderCounter}
                    />
                  )
                )}
              </button>
            ) : (
              <WalletDialogButton
                className={`connect flex text-sm top-10 z-50 custom items-center !bg-white !border-black !rounded-none !font-semibold !border-2 !text-black !py-3 !px-5`}
                style={{
                  boxShadow: '6px 6px 0 0 black'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 mr-2 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Connect Wallet
              </WalletDialogButton>
            )}
          </div>

          {wallet && (
            <div className="flex flex-col mt-18 gap-2">
              <p className="text-white text-lg">
                <b>Wallet:</b> {shortenAddress(wallet.publicKey.toBase58() || '')}
              </p>
              <p className="text-white text-lg">
                <b>Balance:</b> {(balance || 0).toLocaleString()} SOL
              </p>
              <p className="font-bold mt-3 text-white text-lg text-center">
                {itemsRedeemed} / {itemsRemaining}
                <br />
                Geckos Minted
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex h-screen w-full pt-5 z-20 items-start justify-center relative">
        <div className="flex flex-col p-5 items-center justify-center">
          <h1 className="text-white text-8xl title select-none md:text-8xl">
            Geckos-AI
          </h1>
          <span
            className="mt-3 text-md text-center text-white text-justify"
            style={{
              maxWidth: '48rem',
              textShadow: '2px 2px 0 #000',
              fontFamily: 'Quantico'
            }}
          >
            A derivative art collection created by feeding telescopic images of space, sci-fi scenes and patterns, into a neural network algorithm, and applying them to top ranked Geckos using deep learning and AI.
          </span>
        </div>

        <div
          className="bg-white bg-cover rounded-xl flex border-indigo-700 border-2 h-160 z-10 gap-3 absolute items-center justify-center"
          style={{
            // top: 'calc(50% - (40rem / 2) + 5rem)',
            top: '240px',
            width: 'calc(100% - 5rem)',
            maxHeight: 'calc(100% - 260px)',
            backgroundImage: `url(${purpleSpace})`,
          }}
        >
          <div className="bg-black rounded-xl h-full bg-opacity-70 w-full z-0 absolute" />

          <div
            className="bg-cover rounded-lg h-40 transition-transform shadow-2xl w-40 z-20 duration-300 hidden md:block hover:(z-20 transform-gpu scale-110) "
            style={{
              backgroundImage: `url(${firstGecko})`,
            }}
          />
          <div
            className="bg-cover rounded-lg flex-shrink-0 h-45 transition-transform shadow-2xl w-45 duration-300 relative hover:(z-20 transform-gpu scale-110) "
            style={{
              backgroundImage: `url(${secondGecko})`,
            }}
          />
          <div
            className="bg-cover rounded-lg flex-shrink-0 h-35 transition-transform shadow-2xl w-35 duration-300 relative md:h-50 md:w-50 hover:(z-20 transform-gpu scale-110) "
            style={{
              backgroundImage: `url(${thirdGecko})`,
            }}
          />
          <div
            className="bg-cover rounded-lg flex-shrink-0 h-45 transition-transform shadow-2xl w-45 duration-300 relative hover:(z-20 transform-gpu scale-110) "
            style={{
              backgroundImage: `url(${fourthGecko})`,
            }}
          />
          <div
            className="bg-cover rounded-lg h-40 transition-transform shadow-2xl w-40 z-20 duration-300 hidden md:block hover:(z-20 transform-gpu scale-110) "
            style={{
              backgroundImage: `url(${fifthGecko})`,
            }}
          />

          <button
            className="bg-black border-white rounded-none flex font-semibold border-2 mt-12 text-white py-3 px-10 top-5 absolute items-center hover:(text-black bg-white border-black) "
            onClick={() => setModalOpen(true)}
          >
            MINT
          </button>

          <div
            className="flex h-10 w-full bottom-15 z-40 gap-10 absolute justify-center"
            style={{
              fontFamily: 'Quantico'
            }}
          >
            <a
              href="#lore"
              className="text-white text-semibold text-xl hover:underline"
              onClick={() => {
                loreEl.current?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              The Lore
            </a>
            <a
              href="#roadmap"
              className="text-white text-semibold text-xl hover:underline"
              onClick={() => {
                roadmapEl.current?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              Roadmap
            </a>
            <a
              href="#markets"
              className="text-white text-semibold text-xl hover:underline"
              onClick={() => {
                marketsEl.current?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              Secondary Marketplace
            </a>
            <a
              href="#contact"
              className="text-white text-semibold text-xl hover:underline"
              onClick={() => {
                contactEl.current?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              Contact
            </a>
          </div>
        </div>
      </div>

      <div
        ref={loreEl}
        className="bg-black w-full p-10 z-20"
      >
        <div
          className="bg-cover bg-center rounded-xl flex flex-col w-full py-20 px-10 gap-3 relative"
          style={{
            backgroundImage: `url(${blueSpace})`,
            fontFamily: 'Quantico'
          }}
        >
          <div className="bg-black rounded-xl h-full bg-opacity-75 w-full top-0 left-0 z-0 absolute" />

          <span
            className="text-4xl z-20"
            style={{
              color: '#fff',
              textShadow: '0 0 25px #7F4CFF, 0 0 25px #7F4CFF'
            }}
          >
            The Lore
          </span>
          <span
            className="text-white text-xl text-justify z-20 relative"
          >
          A supernova explosion in galaxy GN-z11 almost annihilated the Geckos. Only the strongest 444 warriors survived. The explosion caused a tear in the quantum space-time continuum, having an inexplicable effect on the survivors -- it transmogrified them, binding them intrinsically with the surrounding matter, to live on as mere shadows of their former selves, for all eternity!
          </span>
        </div>
      </div>

      <div
        ref={roadmapEl}
        className="bg-black w-full p-10 z-20"
      >
        <div
          className="bg-cover bg-center rounded-xl flex flex-col w-full py-20 px-10 gap-3 relative"
          style={{
            backgroundImage: `url(${purpleSpace})`,
            fontFamily: 'Quantico'
          }}
        >
          <div className="bg-black rounded-xl h-full bg-opacity-75 w-full top-0 left-0 z-0 absolute" />

          <span
            className="text-4xl z-20"
            style={{
              color: '#fff',
              textShadow: '0 0 25px #7F4CFF, 0 0 25px #7F4CFF'
            }}
          >
            Roadmap
          </span>
          <span
            className="text-white text-xl text-justify z-20 relative"
          >
            - Put the Geckos on Social Media. Community building.
            <br />
            - Mint out 100%.
            <br />
            - Secondary Market Listings on as many marketplaces as possible.
            <br />
            - Planned Airdrops of future neural(AI) artworks to the community (TBA in Discord Server).
          </span>
        </div>
      </div>

      <div
        ref={marketsEl}
        className="bg-black w-full p-10 z-20"
      >
        <div
          className="bg-cover bg-center rounded-xl flex flex-col w-full py-20 px-10 gap-3 relative"
          style={{
            backgroundImage: `url(${blueSpace})`,
            fontFamily: 'Quantico'
          }}
        >
          <div className="bg-black rounded-xl h-full bg-opacity-75 w-full top-0 left-0 z-0 absolute" />

          <span
            className="text-4xl z-20"
            style={{
              color: '#fff',
              textShadow: '0 0 25px #7F4CFF, 0 0 25px #7F4CFF'
            }}
          >
            Secondary Marketplace
          </span>
          <span
            className="text-white text-xl text-justify z-20 relative"
          >
            To be announced!
          </span>
        </div>
      </div>

      <div
        ref={contactEl}
        className="bg-black w-full p-10 z-20"
      >
        <div
          className="bg-cover bg-center rounded-xl flex flex-col w-full py-20 px-10 gap-3 relative"
          style={{
            backgroundImage: `url(${purpleSpace})`,
            fontFamily: 'Quantico'
          }}
        >
          <div className="bg-black rounded-xl h-full bg-opacity-75 w-full top-0 left-0 z-0 absolute" />

          <span
            className="text-4xl z-20"
            style={{
              color: '#fff',
              textShadow: '0 0 25px #7F4CFF, 0 0 25px #7F4CFF'
            }}
          >
            Contact
          </span>
          <span
            className="text-white text-xl text-justify z-20 relative"
          >
            - Project conceptualized & developed by{' '}
            <a
              href="https://twitter.com/zubin_madon"
              target="_blank"
              rel="noreferrer"
              title="Twitter (@zubin-madon)"
              className="border-white border-dotted border-b-1 hover:(text-black bg-white) "
            >
              Zubin Madon
            </a>
            .
            <br />
            -{' '}
            <a
              href="https://github.com/zubin-madon"
              target="_blank"
              rel="noreferrer"
              className="border-white border-dotted border-b-1 hover:(text-black bg-white) "
            >
              Github
            </a>
            .
          </span>
        </div>
      </div>

      <div className="flex w-full top-10 z-30 justify-center absolute">
        <div className="flex mr-auto pl-10 gap-5 items-center relative">
          <a
            href="https://twitter.com/geckosAI"
            target="_blank"
            rel="noreferrer"
            className="flex h-12 fill-white w-12 items-center justify-center hover:(bg-white fill-black) "
          >
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="current" className="h-7 w-7"><title>Twitter</title><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          </a>
          <a
            href="https://discord.gg/NSb2t9ejPY"
            target="_blank"
            rel="noreferrer"
            className="flex h-12 fill-white w-12 items-center justify-center hover:(bg-white fill-black) "
          >
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="current"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
          </a>
        </div>

        <WalletDialogButton
  className={`connect flex text-sm top-10 z-50 custom items-center !rounded-none !font-semibold !border-2 !py-3 !px-5 !fixed md:right-17 !bg-white !text-black ${modalOpen ? 'right-10' : ''}`}
  style={{
    boxShadow: '6px 6px 0 0 black'
  }}
>
  {wallet ? (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 mr-8 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="mr-8">Connected</span>
    </>
  ) : (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 mr-2 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      Connect Wallet
    </>
  )}
</WalletDialogButton>
      </div>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
