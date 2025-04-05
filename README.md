# CreatorsHub
A donation platform that can support content creator online especially for YouTubers


Project management 

## GitHub
- [ ] Env sample 
- [ ] Git ignore 
- [ ] Branches
    - [ ] Main
    - [ ] Hook Call
    - [ ] NFT Mint - Supporter and Creator
    - [ ] Gallery Frontend - Supporter 
    - [ ] Supporter Donation - Frontend
    - [ ] Browser Plugins
    - [ ] Creator Frontend - Management Platform 

## Hook 發想
對標產品：https://cryptocloud.plus
Donate 介面展示：https://demopay.cryptocloud.plus/?currency=USDT&network=TRC20&lang=en&roistat_visit=629537

```
The donate flow is the same as cryptocloud
But we don’t need centralized platforms to manage

Two kinds of people are going to use this platform 
1. Creators
    1. They can create a donation link for them self. Which the creator is going to interact with our factory contract and launch their own donation address. Our frontend can give generate a donate QR code by just adding the address after the URI like (donate.local/qr/<Donate Address Here> to generate the donation page to let the audience can embed it into their website or videos (html embed and video picture embed))
    2. They can use their own address to create the contract so that they can be the owner of the contract and can increase the trust level to creators
    3. Once the creator use out factory contract, we mint a NFT for the creator to let everybody knows that he is the creator and fetch the current channel image
2. Audience

Frontend Function
Public
1. The QR code generator function
2. The Donate page
3. The transcation history of this connect account
Creator Only
1. Can see the income of his donate
2. Can have a UI to withdraw the donate
3. Can use one press swap to let all kinds of polygon asset turn into a single asset (e.g. ETH) (considering using 1inch API)
```
