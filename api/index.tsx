import { Button, Frog, TextInput, parseEther } from 'frog';
import { handle } from 'frog/vercel';
import { ethers } from 'ethers';
import { devtools } from 'frog/dev';
import { neynar, type NeynarVariables } from 'frog/middlewares'
import { serveStatic } from 'frog/serve-static';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];

const usdcProxyAbi = [{"inputs":[{"internalType":"address","name":"implementationContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"}];

const mainDBTable = 'donation_campaigns';
const secondaryDBTable = 'donations_currency';

type State = {
  values: string[]
}

const colors = {
  background: '#0049AD',
  dark: '#01193A',
  shadow: '#00347C',
  lightShadow: '#066FFF',
  light: '#368BFF',
  lightest: '#2A08FF',
  altBackground: '#FFCA00',
  altDark: '#594600',
  altShadow: '#BC9500',
  altLightShadow: '#FFD123',
  altLight: '#FFCA00',
  altLightest: '#FFAC23',
  mainText: '#FFFFFF',
  goodIcon: '#368BFF',
  badIcon: '#e31b1b',
  mainTextAlt: '#191919'
}

export const app = new Frog<{ State: State }>({
  initialState: {
    values: []
  },
  assetsPath: '/',
  basePath: '/api',
  imageOptions: {
    fonts: [
      {
        name: 'Space Grotesk',
        source: 'google',
      },
      {
        name: 'Open Sans',
        source: 'google',
      },
    ],
  },
}).use
(
    neynar({
      apiKey: process.env.NEXT_PUBLIC_NEYNAR_API,
      features: ['interactor', 'cast'],
    }),
  )

const CenteredImage = ({ imageUrl }) => {
  return (
    <div style={{
      alignItems: 'center',
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'center',
      textAlign: 'center',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: '1',
      width: '100%',
    }}>
      <img src={imageUrl} style={{width: '125%', height: '125%'}} />
    </div>
  );
}

const CheckmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    version="1.1"
    width="80"
    height="80"
    viewBox="0 0 256 256"
    xmlSpace="preserve"
  >
    <g
      style={{
        stroke: 'none',
        strokeWidth: 0,
        strokeDasharray: 'none',
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeMiterlimit: 10,
        fill: 'none',
        fillRule: 'nonzero',
        opacity: 1,
      }}
      transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
    >
      <polygon
        points="37.95,64.44 23.78,50.27 30.85,43.2 37.95,50.3 59.15,29.1 66.22,36.17"
        style={{
          stroke: 'none',
          strokeWidth: 1,
          strokeDasharray: 'none',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeMiterlimit: 10,
          fill: 'rgb(54, 139, 255)',
          fillRule: 'nonzero',
          opacity: 1,
        }}
        transform="matrix(1 0 0 1 0 0)"
      />
      <path
        d="M 45 90 C 20.187 90 0 69.813 0 45 C 0 20.187 20.187 0 45 0 c 24.813 0 45 20.187 45 45 C 90 69.813 69.813 90 45 90 z M 45 10 c -19.299 0 -35 15.701 -35 35 s 15.701 35 35 35 s 35 -15.701 35 -35 S 64.299 10 45 10 z"
        style={{
          stroke: 'none',
          strokeWidth: 1,
          strokeDasharray: 'none',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeMiterlimit: 10,
          fill: 'rgb(54, 139, 255)',
          fillRule: 'nonzero',
          opacity: 1,
        }}
        transform="matrix(1 0 0 1 0 0)"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

const RedXIcon = () => (
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    width="80px"
    height="80px"
    viewBox="0 0 122.879 122.879"
    enableBackground="new 0 0 122.879 122.879"
    xmlSpace="preserve"
  >
    <g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#e31b1b"
        d="M61.44,0c33.933,0,61.439,27.507,61.439,61.439 s-27.506,61.439-61.439,61.439C27.507,122.879,0,95.372,0,61.439S27.507,0,61.44,0L61.44,0z M73.451,39.151 c2.75-2.793,7.221-2.805,9.986-0.027c2.764,2.776,2.775,7.292,0.027,10.083L71.4,61.445l12.076,12.249 c2.729,2.77,2.689,7.257-0.08,10.022c-2.773,2.765-7.23,2.758-9.955-0.013L61.446,71.54L49.428,83.728 c-2.75,2.793-7.22,2.805-9.986,0.027c-2.763-2.776-2.776-7.293-0.027-10.084L51.48,61.434L39.403,49.185 c-2.728-2.769-2.689-7.256,0.082-10.022c2.772-2.765,7.229-2.758,9.953,0.013l11.997,12.165L73.451,39.151L73.451,39.151z"
      />
    </g>
  </svg>
);

app.frame('/', async (c) => {
  const { buttonValue, status, previousState } = c;
  const frameId = c.req.query('frameId') || 4;
  const campaignData = await getCampaignData(frameId);
  const entityData   = await getEntitiesData(campaignData.entity_id);
  return c.res({
    image: (
      <div style={{ color: entityData.color_altLight || colors.altLight, display: 'flex',  backgroundColor: entityData.color_background || colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', backgroundColor: entityData.color_shadow || colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'center', borderRadius: '2rem', height: '100%'}}>
          <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: entityData.color_altLight || colors.altLight}}>
            {(campaignData.name) && (
              <span style={{fontSize: 40, marginBottom: '1rem'}}>
                {campaignData.name}
              </span>
            )}
            {(campaignData && campaignData.short_description) && (
              <div style={{display: 'flex', flexDirection: 'column', color: entityData.color_mainText || colors.mainText, fontSize: 68, marginBottom: '3rem', fontWeight: '700', lineHeight: '1'}}>
                {campaignData.short_description || ''}
              </div>
            )}
            {(campaignData.donations_goal && campaignData.campaign_end) && (
              <span style={{color: entityData.color_altLight || colors.altLight, fontSize: 34, marginBottom: '2rem'}}>
                Their Fundraising Goal: ${campaignData.donations_goal.toLocaleString()} by {formatDate(campaignData.campaign_end)}
              </span>
            )}
          </div>
        </div>
      </div>
    ),
    title: 'HALP: Transparent Fundraising Frame',
    intents: [
      <Button value={frameId.toString()} action="/start">Learn More!</Button>,
      <Button value={frameId.toString()} action="/donate">Donate</Button>,
      <Button.Link href={`https://warpcast.com/~/compose?text=Check%20out%20this%20Donation%20Frame%20to%20use%20your%20Tip%20Allowance%20or%20crypto%20to%20donate%20to%buy%20drinks&embeds[]=https://donate.framesframes.xyz/api?frameId=${frameId.toString()}`}>Share</Button.Link>,
    ]
  })
});

app.frame('/start', async (c) => {
  const { buttonValue, status, frameData } = c;
  const { fid, castId } = frameData;
  const frameId = c.req.query('frameId') || buttonValue;
  const campaignData = await getCampaignData(frameId);
  const entityData   = await getEntitiesData(campaignData.entity_id);
  const percentRaised = await getDonationTotal(campaignData);
  return c.res({
    image: (
      <div style={{ color: entityData.color_altLight || colors.altLight, display: 'flex',  backgroundColor: entityData.color_background || colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', backgroundColor: entityData.color_shadow || colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'center', borderRadius: '2rem', height: '100%'}}>
          <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: entityData.color_altLight || colors.altLight}}>
            <span style={{fontSize: 38, marginBottom: '1rem'}}>
              {campaignData.opening_title || ''}
            </span>
            <span style={{color: entityData.color_mainText || colors.mainText, fontSize: 40, marginBottom: '3rem', fontWeight: '700', lineHeight: '1'}}>
              {campaignData.opening_text || ''}
            </span>
            <span style={{color: entityData.color_altLight || colors.altLight, fontSize: 30, marginBottom: '1rem'}}>
              Their Summer Fundraising Goal: ${campaignData.donations_goal.toLocaleString()} by  {campaignData.campaign_end}.
            </span>
            <div style={{display: 'flex', flexDirection: 'row', width: '80vw', borderRadius: '4rem', backgroundColor: entityData.color_dark || colors.dark, padding: '1rem', minHeight: '1rem', justifyContent: 'center', aligntItems: 'center'}}>
              <div style={{backgroundColor: entityData.color_altLight || colors.altLight, color: entityData.color_mainTextAlt || colors.mainTextAlt, width: percentRaised + '%', minHeight: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'center', textAlign: 'center', borderRadius: '4rem', marginRight: 'auto', alignItems: 'center'}}>{percentRaised}%</div>
              <div style={{display: 'flex', flexDirection: 'row', flex: '1'}}></div>
            </div>
          </div>
        </div>
      </div>
    ),
    title: 'HALP: Transparent Fundraising Frame',
    intents: [
      <Button value={frameId.toString()} action="/about">About</Button>,
      <Button value={frameId.toString()} action="/fund-use">Fund Usage</Button>,
      <Button value={frameId.toString()} action="/donate">Donate</Button>,
      <Button value={frameId.toString()} action="/verify">Verify</Button>,
    ]
  })
});

app.frame('/about/:slide?', async (c) => {
  const { buttonValue, status, frameData, previousState } = c;
  const frameId = buttonValue;
  var intents = [];
  const campaignData = await getCampaignData(frameId);
  const entityData   = await getEntitiesData(campaignData.entity_id);
  const allSlideData = await getEntitiesStoryParts(campaignData.entity_id);
  const slide = c.req.param('slide') || 0;
  const slideData = allSlideData.story[slide];
  intents.push(<Button value={frameId.toString()} action="/start">Home</Button>);
  intents.push(<Button value={frameId.toString()} action="/donate">Donate</Button>);
  if(allSlideData.story.length > 1 && slide >= 1 && allSlideData.story.length){
    intents.push(<Button value={frameId.toString()} action={'/about/' + parseInt(parseInt(slide) - 1)}>Previous</Button>);
  }
  if(allSlideData.story.length > 1 && allSlideData.story.length > slide){
    intents.push(<Button value={frameId.toString()} action={'/about/' + parseInt(parseInt(slide) + 1)}>Next</Button>);
  }
  const renderedSlide = renderSlide(slideData, entityData);
  return c.res({
    image: renderedSlide,
    title: 'HALP: Transparent Fundraising Frame',
    intents: intents
  })
});

app.frame('/fund-use/:slide?', async (c) => {
  const { buttonValue, status, frameData, previousState } = c;
  const frameId = buttonValue;
  var intents = [];
  const campaignData = await getCampaignData(frameId);
  const entityData   = await getEntitiesData(campaignData.entity_id);
  const allSlideData = await getEntitiesStoryParts(campaignData.entity_id);
  const slide = c.req.param('slide') || 0;
  const slideData = allSlideData.funding[slide];
  intents.push(<Button value={frameId.toString()} action="/start">Home</Button>);
  intents.push(<Button value={frameId.toString()} action="/donate">Donate</Button>);
  if(allSlideData.funding.length <= 1){
    intents.push(<Button value={frameId.toString()} action="/verify">Verify</Button>);
  }
  if(allSlideData.funding.length > 1 && slide >= 1 && allSlideData.funding.length){
    intents.push(<Button value={frameId.toString()} action={'/fund-use/' + parseInt(parseInt(slide) - 1)}>Previous</Button>);
  }
  if(allSlideData.funding.length > 1 && allSlideData.funding.length > slide){
    intents.push(<Button value={frameId.toString()} action={'/fund-use/' + parseInt(parseInt(slide) + 1)}>Next</Button>);
  }
  const renderedSlide = renderSlide(slideData, entityData);
  return c.res({
    image: renderedSlide,
    title: 'HALP: Transparent Fundraising Frame',
    intents: intents
  })
});

app.frame('/verify', async (c) => {
  const { buttonValue, status, frameData } = c;
  const { fid, castId } = frameData;
  const frameId = c.req.query('frameId') || buttonValue;
  const campaignData = await getCampaignData(frameId);
  const entityData   = await getEntitiesData(campaignData.entity_id);
  const frameCreatorUrl = campaignData.website;
  const suppliedWallet = campaignData.wallet;
  const userId = campaignData.fid;
  var verificationData = await verifyWallets(frameCreatorUrl, suppliedWallet, userId, c.var.cast);
  return c.res({
    image: (
      <div style={{ color: entityData.color_altLight || colors.altLight, display: 'flex',  backgroundColor: entityData.color_background || colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', backgroundColor: entityData.color_shadow || colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'center', borderRadius: '2rem', height: '100%'}}>
          <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: entityData.color_altLight || colors.altLight}}>
            <span style={{fontSize: 38, marginBottom: '1rem'}}>
              Verification Information
            </span>
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: entityData.color_mainText || colors.mainText, fontSize: 34, marginBottom: '2rem'}}>
                <span>
                  {(verificationData && verificationData.verified_donations) && (
                    <CheckmarkIcon />
                  )}
                  {(!verificationData || !verificationData.verified_donations) && (
                    <RedXIcon />
                  )}
                </span>
                  {(verificationData && verificationData.verified_donations) && (
                    <span style={{ marginLeft: '3rem', textAlign: 'left'}}>
                      DONATIONS: Funds will be sent to the wallet used by the entity matches their website's wallets.json file.
                    </span>
                  )}
                  {(!verificationData || !verificationData.verified_donations) && (
                    <span style={{ marginLeft: '3rem', textAlign: 'left'}}>
                      DONATIONS: The wallet for this frame does NOT MATCH the website's wallets.json file -- donations are going somewhere else.
                    </span>
                  )}
              </div>
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: entityData.color_mainText || colors.mainText, fontSize: 34, marginBottom: '2rem'}}>
                <span>
                  {(verificationData && verificationData.verified_tips) && (
                    <CheckmarkIcon />
                  )}
                  {(!verificationData || !verificationData.verified_tips) && (
                    <RedXIcon />
                  )}
                </span>
                {(verificationData && verificationData.verified_tips) && (
                    <span style={{ marginLeft: '3rem', textAlign: 'left'}}>
                      TIPS: Any Tips will be sent to the wallet address matching the entities wallets.json file on their website.
                    </span>
                  )}
                  {(!verificationData || !verificationData.verified_tips) && (
                    <span style={{ marginLeft: '3rem', textAlign: 'left'}}>
                      TIPS: The entities wallets.json file on their website does NOT MATCH the poster's wallet -- Tips will go elsewhere.
                    </span>
                  )}
              </div>
            <span style={{fontSize: 30, marginBottom: '1rem'}}>
              Website: {campaignData.website}
            </span>
            <span style={{fontSize: 30, marginBottom: '1rem'}}>
              Wallet: {campaignData.wallet}
            </span>
            <span style={{fontSize: 30, marginBottom: '2rem'}}>
              Frame Creator's FC Account: @{campaignData.username}
            </span>
            <span style={{fontSize: 38, color: entityData.color_altLightest || colors.altLightest}}>
              Confirm for yourself using the buttons below!
            </span>
          </div>
        </div>
      </div>
    ),
    title: 'HALP: Transparent Fundraising Frame',
    intents: [
      <Button value={frameId.toString()} action="/start">Home</Button>,
      <Button.Link href={campaignData.website + '/wallets.json'}>Wallets.json</Button.Link>,
      <Button.Link href={campaignData.website}>Website</Button.Link>,
      <Button.Link href={'https://warpcast.com/' + campaignData.username}>Their Profile</Button.Link>,
    ]
  })
});

app.frame('/donate', async (c) => {
  const { buttonValue, status, frameData, deriveState, previousState } = c;
  const { fid, castId } = frameData;
  const frameId = buttonValue;
  const state = deriveState(previousState => {
    previousState.frameId = frameId;
  })
  const campaignData = await getCampaignData(frameId);
  const entityData = await getEntitiesData(campaignData.entity_id);
  return c.res({
    action: '/donation-post',
    image: (
      <div style={{ color: entityData.color_altLight || colors.altLight, display: 'flex',  backgroundColor: entityData.color_background || colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', backgroundColor: entityData.color_shadow || colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'center', borderRadius: '2rem', height: '100%'}}>
          <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: entityData.color_altLight || colors.altLight}}>
            <span style={{fontSize: 50, marginBottom: '1rem'}}>
              Tip this Frame or Donate Directly
            </span>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 34, marginBottom: '1rem', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{color: entityData.color_altLightest || colors.altLightest, fontWeight: '700', fontSize: 36}}>Every $1donated</span>
              <span style={{color: entityData.color_mainText || colors.mainText}}>We are closer to an entire drink</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 34, marginBottom: '2rem', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{color: entityData.color_altLightest || colors.altLightest, fontWeight: '700', fontSize: 36}}>Every $10 donated</span>
              <span style={{color: entityData.color_mainText || colors.mainText}}>We can buy canned beverages!</span>
            </div>
            <span style={{fontSize: 26, color: entityData.color_light || colors.light}}>
              Note: You can confirm this frame is going to the right entity by the "Verify" button on the main screen.  Only Tips on the original Frame will goto the entity.
            </span>
          </div>
        </div>
      </div>
    ),
    title: 'HALP: Transparent Fundraising Frame',
    intents: [
      <Button value={frameId.toString()} action="/start">Home</Button>,
      <Button value={frameId.toString()} action="/verify">Verify</Button>,
      <Button value={frameId.toString()} action="/donate-action">Donate</Button>,
      <Button value={frameId.toString()} action="/tip-action">Tip</Button>,
    ]
  })
});

app.frame('/donate-action', async (c) => {
  const { buttonValue, status, frameData } = c;
  const { fid, castId } = frameData;
  const frameId = buttonValue;
  const campaignData = await getCampaignData(frameId);
  const entityData = await getEntitiesData(campaignData.entity_id);
  const frameCreatorUrl = campaignData.website;
  const suppliedWallet = campaignData.wallet;
  const userId = campaignData.fid;
  var verificationData = await verifyWallets(frameCreatorUrl, suppliedWallet, userId, c.var.cast);
  return c.res({
    action: '/donation-post',
    image: (
      <div style={{ color: entityData.color_altLight || colors.altLight, display: 'flex',  backgroundColor: entityData.color_background || colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', backgroundColor: entityData.color_shadow || colors.shadow, padding: '4rem', alignItems: 'center', justifyContent: 'flex-start', borderRadius: '2rem', height: '100%'}}>
          <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: entityData.color_altLight || colors.altLight}}>
            <span style={{fontSize: 50, marginBottom: '1rem'}}>
              Donate Directly
            </span>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 34, alignItems: 'center', justifyContent: 'center', marginBottom: '3rem'}}>
              <span style={{color: entityData.color_mainText || colors.mainText, fontWeight: '700', fontSize: 36}}>To Dontate: Enter an Amount in the field below, then click the currency button you wish to use.</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: entityData.color_mainText || colors.mainText, fontSize: 34, marginBottom: '2rem', backgroundColor: entityData.color_dark || colors.dark, padding: '2rem 4rem', borderRadius: '4rem', marginTop: '2rem'}}>
              <span>
                {(verificationData && verificationData.verified_donations) && (
                  <CheckmarkIcon />
                )}
                {(!verificationData || !verificationData.verified_donations) && (
                  <RedXIcon />
                )}
              </span>
              {(verificationData && verificationData.verified_donations) && (
                <span style={{ marginLeft: '3rem', textAlign: 'left', color: entityData.color_mainTextAlt || colors.mainTextAlt }}>
                  DONATIONS: Funds will be sent to the wallet used by the entity matches their website's wallets.json file.
                </span>
              )}
              {(!verificationData || !verificationData.verified_donations) && (
                <span style={{ marginLeft: '3rem', textAlign: 'left', color: entityData.color_mainTextAlt || colors.mainTextAlt }}>
                  DONATIONS: The wallet for this frame does NOT MATCH the website's wallets.json file -- donations are going somewhere else.
                </span>
              )}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 26, color: entityData.color_light || colors.light}}>
              Note: You can confirm this frame's info yourself by the "Verify" button below.
            </div>
          </div>
        </div>
      </div>
    ),
    title: 'HALP: Transparent Fundraising Frame',
    intents: [
      <TextInput placeholder="Donation Amount in ETH or USDC" />,
      <Button value={frameId.toString()} action="/start">Home</Button>,
      <Button value={frameId.toString()} action="/verify">Verify</Button>,
      <Button.Transaction value={frameId.toString()} target="/donation-usdc">USDC</Button.Transaction>,
      <Button.Transaction value={frameId.toString()} target="/donation-eth">ETH</Button.Transaction>,
    ]
  })
});

app.frame('/tip-action', async (c) => {
  const { buttonValue, status, frameData } = c;
  const { fid, castId } = frameData;
  const frameId = buttonValue;
  const campaignData = await getCampaignData(frameId);
  const entityData = await getEntitiesData(campaignData.entity_id);
  const frameCreatorUrl = campaignData.website;
  const suppliedWallet = campaignData.wallet;
  const userId = campaignData.fid;
  var verificationData = await verifyWallets(frameCreatorUrl, suppliedWallet, userId, c.var.cast);
  return c.res({
    image: (
      <div style={{ color: entityData.color_altLight || colors.altLight, display: 'flex',  backgroundColor: entityData.color_background || colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', backgroundColor: entityData.color_shadow || colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'center', borderRadius: '2rem', height: '100%'}}>
          <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: entityData.color_altLight || colors.altLight}}>
            <span style={{fontSize: 50, marginBottom: '1rem'}}>
              Tip your Allowance to this cause
            </span>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 34, marginBottom: '1rem', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{color: entityData.color_mainText || colors.mainText, fontWeight: '700', fontSize: 36}}>Simply Reply to this Cast with your preferred Tips and it will goto the cause directly.</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: entityData.color_mainText || colors.mainText, fontSize: 34, marginBottom: '2rem', backgroundColor: entityData.color_dark || colors.dark, padding: '2rem 4rem', borderRadius: '4rem', marginTop: '2rem'}}>
              <span>
                {(verificationData && verificationData.verified_tips) && (
                  <CheckmarkIcon />
                )}
                {(!verificationData || !verificationData.verified_tips) && (
                  <RedXIcon />
                )}
              </span>
              {(verificationData && verificationData.verified_tips) && (
                  <span style={{ marginLeft: '3rem', textAlign: 'left', color: entityData.color_mainTextAlt || colors.mainTextAlt }}>
                    TIPS: Any Tips will be sent to the wallet address matching the entity's wallets.json file on their website.
                  </span>
                )}
                {(!verificationData || !verificationData.verified_tips) && (
                  <span style={{ marginLeft: '3rem', textAlign: 'left',  color: entityData.color_mainTextAlt || colors.mainTextAlt }}>
                    TIPS: The entity's wallets.json file on their website does NOT MATCH the poster's wallet -- Tips will go elsewhere.
                  </span>
                )}
            </div>
            <span style={{fontSize: 26, color: entityData.color_light || colors.light}}>
              Note: You can confirm this frame is accurate yourself by checking the "Verify" button on the main screen.  Tips on the original Frame will goto the entity.
            </span>
          </div>
        </div>
      </div>
    ),
    title: 'HALP: Transparent Fundraising Frame',
    intents: [
      <Button value={frameId.toString()} action="/start">Home</Button>,
      <Button value={frameId.toString()} action="/donate-action">Donate Instead</Button>,
    ]
  })
});

app.frame('/donation-post', async (c) => {
  const { transactionId, buttonValue, status, frameData, previousState, deriveState } = c;
  const { fid, castId } = frameData;
  const frameId = previousState.frameId || buttonValue;
  const campaignData = await getCampaignData(frameId);
  const userDetails  = await fetchNeynarUserData(fid);
  const entityData = await getEntitiesData(campaignData.entity_id);
  var donationDetails = {
    fid: fid,
    username: userDetails.username,
    tx_in: transactionId,
    frame_id: frameId,
    status: 'received'
  }
  await storeDonation(donationDetails);
  return c.res({
    image: (
      <div style={{ color: entityData.color_altLight || colors.altLight, display: 'flex',  backgroundColor: entityData.color_background || colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', backgroundColor: entityData.color_shadow || colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'center', borderRadius: '2rem', height: '100%'}}>
          <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: entityData.color_altLight || colors.altLight}}>
            <span style={{fontSize: 55, marginBottom: '1rem'}}>
              Thanks for your Donation!
            </span>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 34, marginBottom: '2rem', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{color: entityData.color_altLightest || colors.altLightest, fontWeight: '700', fontSize: 40}}>Your donation has contributed to reaching our goal.</span>
              <span style={{color: entityData.color_altLight || colors.altLight}}>For more information on how funds will be used please view our "Fund Use" section.</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', fontSize: 34, marginBottom: '2rem', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{color: entityData.color_altLightest || colors.altLightest, fontWeight: '700', fontSize: 40}}>Want to help even more?</span>
              <span style={{color: entityData.color_altLight || colors.altLight}}>Sharing this frame to spred awareness is greatly appreciated!</span>
            </div>
          </div>
        </div>
      </div>
    ),
    title: 'HALP: Transparent Fundraising Frame',
    intents: [
      <Button value={frameId.toString()} action="/start">Home</Button>,
      <Button value={frameId.toString()} action="/fund-use">Fund Use</Button>,
      <Button.Link href={`https://warpcast.com/~/compose?text=Check%20out%20this%20Donation%20Frame%20to%20use%20your%20Tip%20Allowance%20or%20crypto%20to%20donate%20to%buy%20drinks&embeds[]=https://donate.framesframes.xyz/api?frameId=${frameId.toString()}`}>Share</Button.Link>,
    ]
  })
});


app.transaction('/donation-eth', (c) => {
  const { inputText, buttonValue, frameData, previousState  } = c;
  try {
    previousState.donationAmount = inputText;
    previousState.frameId = buttonValue;
    return c.send({
      chainId: 'eip155:8453',
      to: donationWallet,
      value: parseEther(inputText),
    })
  } catch (error){
    console.log(error);
  }
})

app.transaction('/donation-usdc', async (c) => {
  const { inputText, buttonValue, frameData, previousState  } = c;
  if(inputText){
    previousState.donationAmount = inputText;
    previousState.frameId = buttonValue;
    const amount = ethers.parseUnits(inputText.toString(), 6);
    return c.contract({
      abi,
      chainId: 'eip155:8453',
      functionName: 'transfer',
      args: [donationWallet, amount],
      to: tokenContract
    })
  }
})

/**
 * SLIDE RENDERING
 */
async function renderSlide(slideData, entityData) {
  if(!slideData){
    return slideNoData(entityData);
  } else {
    if(slideData.layout == 'SimpleSlideWithLeftImage'){
      return slideLeftImage(slideData, entityData);
    } else if(slideData.layout == 'RightImageSlide'){
      return slideRightImage(slideData, entityData);
    } else if(slideData.layout == 'BackgroundImageSlide'){
      return slideBackgroundImage(slideData, entityData);
    } else {
      return slideCenteredText(slideData, entityData);
    }
  }
}

async function slideBackgroundImage(slideData, entityData){
  return (
    <div style={{ color: colors.altLight, display: 'flex',  backgroundColor: colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh', width: '100vw'}}>
      <CenteredImage imageUrl={slideData.image} />
      <div style={{display: 'flex', flexDirection: 'column', padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'space-between', borderRadius: '2rem', height: '100%', backgroundColor: '#1633408a'}}>
        <div style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'left', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: colors.altLight, width: '100%'}}>
          <span style={{fontSize: 60, marginBottom: '1rem', color: colors.altLightest}}>
            {slideData.title}
          </span>
          {(slideData.texts && slideData.texts.length) && (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {slideData.texts.map((text, index) => (
                <span key={index} style={{color: 'white', fontSize: 36, marginBottom: '2rem', lineHeight: '1'}}>
                  {text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function slideCenteredText(slideData, entityData){
  return (
    <div style={{ color: colors.altLight, display: 'flex',  backgroundColor: colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
      <div style={{display: 'flex', flexDirection: 'column', backgroundColor: colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'center', borderRadius: '2rem', height: '100%'}}>
        <div style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: colors.altLight}}>
          <span style={{fontSize: 40, marginBottom: '2rem',lineHeight: '1'}}>
            {slideData.title}
          </span>
          {(slideData.texts && slideData.texts.length) && (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {slideData.texts.map((text, index) => (
                <span key={index} style={{color: 'white', fontSize: 36, marginBottom: '1rem', fontWeight: '300', lineHeight: '1'}}>
                  {text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function slideLeftImage(slideData, entityData){
  return (
    <div style={{ color: entityData.color_altLight || colors.altLight, display: 'flex',  backgroundColor: entityData.color_background || colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
      <div style={{display: 'flex', flexDirection: 'row', backgroundColor: entityData.color_shadow || colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'space-between', borderRadius: '2rem', height: '100%'}}>
        {(slideData.image) && (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '25%', marginRight: '4rem'}}>
            <img style={{width: '100%'}} src={slideData.image} />
          </div>
        )}
        <div style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'left', alignItems: 'flex-start', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: entityData.color_altLight || colors.altLight, width: (slideData.image) ? '72%' : '100%'}}>
          <span style={{fontSize: 40, marginBottom: '1rem', textAlign: 'left'}}>
            {slideData.title}
          </span>
          {(slideData.texts && slideData.texts.length) && (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {slideData.texts.map((text, index) => (
                <span key={index} style={{color: entityData.color_mainText || colors.mainText, fontSize: 34, marginBottom: '3rem', fontWeight: '300', lineHeight: '1'}}>
                  {text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function slideRightImage(slideData, entityData){
  return (
    <div style={{ color: colors.altLight, display: 'flex',  backgroundColor: colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
      <div style={{display: 'flex', flexDirection: 'row', backgroundColor: colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'space-between', borderRadius: '2rem', height: '100%'}}>
        <div style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'left', alignItems: 'flex-start', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: colors.altLight, width: '72%'}}>
          <span style={{fontSize: 40, marginBottom: '1rem', textAlign: 'left'}}>
            {slideData.title}
          </span>
          {(slideData.texts && slideData.texts.length) && (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {slideData.texts.map((text, index) => (
                <span key={index} style={{color: 'white', fontSize: 34, marginBottom: '3rem', fontWeight: '300', lineHeight: '1'}}>
                  {text}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '25%', marginRight: '4rem'}}>
          <img style={{width: '100%'}} src={slideData.image} />
        </div>
      </div>
    </div>
  );
}

async function slideNoData(entityData){
  return (
    <div style={{ color: colors.altLight, display: 'flex',  backgroundColor: colors.background, padding: '1rem', fontSize: 30, flexDirection: 'column', justifyContent:'center', height: '100vh'}}>
      <div style={{display: 'flex', flexDirection: 'row', backgroundColor: colors.shadow, padding: '4rem', flex: '1', alignItems: 'center', justifyContent: 'space-between', borderRadius: '2rem', height: '100%'}}>
        <div style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'left', alignItems: 'flex-start', flexDirection: 'column', fontFamily: 'font-["Space Grotesk"]', color: colors.altLight, width: '72%'}}>
          <span style={{fontSize: 40, marginBottom: '1rem', textAlign: 'left'}}>
            Whoops! Content not found!
          </span>
          <span style={{color: 'white', fontSize: 34, marginBottom: '3rem', fontWeight: '300', lineHeight: '1'}}>
            {"You may have found an Entity who is in the middle of setting up their account and posted this before they were ready.  We're sorry for the inconvenient situation."}
          </span>
        </div>
      </div>
    </div>
  );
}

async function getCampaignData(campaignId) {
  if(campaignId){
    const { data, error } = await supabase
      .from(mainDBTable)
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) {
      console.error('Error fetching campaign data:', error);
      return null;
    }

    return data;
  }
  return null;
}

async function getEntitiesData(entityId) {
  const { data: entitiesData, error: entitiesError } = await supabase
    .from('donation_entities')
    .select('*')
    .eq('id', entityId);

  if (entitiesError) {
    console.error('Error fetching entities data:', entitiesError);
    return null;
  }

  return entitiesData[0];
}

async function getEntitiesStoryParts(entityId) {
  const { data, error } = await supabase
    .from('donations_content_parts')
    .select('*')
    .eq('entity_id', entityId);
  if (error) {
    console.error('Error fetching story parts:', error);
    return null;
  }
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.content_type]) {
      acc[item.content_type] = [];
    }
    acc[item.content_type].push(item);
    return acc;
  }, {});

  return groupedData;
}

async function verifyWallets(frameCreatorUrl, suppliedWallet, userId, castObject) {
  var verificationResponse = {
    wallet_supplied: false,
    wallet_json_found: false,
    verified_donations: false,
    verified_tips: false,
  }
  try {
    const walletsResponse = await axios.get(`${frameCreatorUrl}/wallets.json`);
    const walletsData = walletsResponse.data;
    verificationResponse.wallet_json_found = Array.isArray(walletsData) && walletsData.every(item => typeof item === 'object' && 'wallet' in item);

    if (verificationResponse.wallet_json_found) {
      const walletAddresses = walletsData.map(item => item.wallet.toLowerCase());
      const suppliedWalletLower = suppliedWallet.toLowerCase();
      verificationResponse.wallet_supplied = walletAddresses.includes(suppliedWalletLower);
      verificationResponse.verified_donations = verificationResponse.wallet_supplied;
      if(castObject && castObject.author && castObject.author.fid == userId && castObject.author.verifications){
        const verifiedWallets = castObject.author.verifications.map(wallet => wallet.toLowerCase());
        verificationResponse.verified_tips = verifiedWallets.some(wallet => walletAddresses.includes(wallet.toLowerCase()));
      }
    }
    return verificationResponse;
  } catch (error) {
    console.log('error', error);
    return verificationResponse;
  }
}

async function fetchNeynarUserData(fid){
  const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API || '';
  const headers: Record<string, string> = {
    accept: 'application/json'
  };
  if (apiKey) {
    headers['api_key'] = apiKey;
  }
  const options = {
    method: 'GET',
    headers: { accept: 'application/json', 'api_key': apiKey }
  };
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=1`;
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const userData = data.users;
    if(userData && userData.length){
      return userData[0];
    } else {
      return null;
    }
  } catch(e){
    return null;
  }
}



async function getDonationTotal(campaignData) {
  try {
    const { ethPrice, degenPrice } = await fetchPrices();
    const donationSum = (
      (Math.floor(campaignData.donations_amount * ethPrice)) +
      (Math.floor(campaignData.donations_amount_degen_tips * degenPrice)) +
      (campaignData.donations_amount_usdc)
    );
    const percentRaised = ((donationSum / campaignData.donations_goal) * 100).toFixed(1);
    return percentRaised;
  } catch (error) {
    console.error('Error fetching or calculating donation total:', error);
    return '0'; // Return 'N/A' if there's an error
  }
}

const fetchPrices = async () => {
  const { data, error } = await supabase
    .from('halp_constants')
    .select('h_key, h_value')
    .in('h_key', ['eth_price', 'degen_price']);
  if (error) {
    throw new Error('Failed to fetch prices from halp_constants');
  }
  const prices = data.reduce((acc, item) => {
    acc[item.h_key] = parseFloat(item.h_value);
    return acc;
  }, {});
  return {
    ethPrice: prices.eth_price,
    degenPrice: prices.degen_price
  };
};


async function storeDonation(details) {
  const { data, error } = await supabase
    .from(secondaryDBTable)
    .insert([
      {
        fid: details.fid,
        username: details.username,
        tx_in: details.tx_in,
        frame_id: details.frame_id,
        status: 'received'
      }
    ]);

  if (error) {
    throw error;
  }
  return data;
}

async function getTransactionDetails(transactionId: string): Promise<any> {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const tx = await provider.getTransaction(transactionId);
  var amount = 0;
  if (!tx) {
    throw new Error('Transaction not found');
  }
  const receipt = await provider.getTransactionReceipt(transactionId);
  if (tx.to && tx.data && tx.to.toLowerCase() == tokenContract.toLowerCase()) {
    const iface = new ethers.Interface(abi);
    const decodedData = iface.decodeFunctionData('transfer', tx.data);
    amount = (decodedData && decodedData.length > 1) ? decodedData[1] : 0;
  } else {
    amount = tx.value.toString(); // For ETH transfers
  }
  const humanReadableAmount = tx.to && tx.to.toLowerCase() == tokenContract.toLowerCase()
    ? ethers.formatUnits(amount.toString(), 6) // USDC has 6 decimals
    : ethers.formatUnits(amount.toString(), 18); // ETH has 18 decimals
  return {
    from: tx.from,
    to: tx.to,
    amount: humanReadableAmount,
    status: receipt.status
  };
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  const daySuffix = (day) => {
    if (day > 3 && day < 21) return 'th'; // covers 11th to 19th
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  return month + ', ' + day + ' ' + daySuffix(day) + ' ' + year;
}

export const GET = handle(app)
export const POST = handle(app)
devtools(app, { serveStatic })