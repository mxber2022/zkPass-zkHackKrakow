"use client"
import { useState } from "react"
import styles from "./page.module.css"
import TransgateConnect from "@zkpass/transgate-js-sdk"
import styled from "styled-components"
import JSONPretty from "react-json-pretty"
import { verifyMessageSignature } from "./helper"
import { ethers } from "ethers"
import AttestationABI from "./AttestationABI.json"
import { useEffect } from "react"

const FormGrid = styled.div`
  display: grid;
  grid-gap: 36px;
  grid-template-columns: 800px;
  margin: 3rem auto;
`

const FromContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
`

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 1rem;
`

const Label = styled.div`
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
`

const Input = styled.input`
  display: block;
  background-color: #ffffff;
  border-radius: 5px;
  height: 35px;
  line-height: 35px;
  width: 100%;
  padding: 0 18px;
  outline: none;
  color: #000000;
`

const Button = styled.button<{ disabled?: boolean }>`
  position: relative;
  display: block;
  min-width: 120px;
  height: 35px;
  line-height: 35px;
  padding: 0 18px;
  text-align: center;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  background: #c5ff4a;
  color: var(--color-black);
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  &:active {
    border: 0.5px solid #898989;
    color: #0a0a0aab;
  }
`

const RightContainer = styled.div`
  grid-column: 2 / 3;
`

const Title = styled.h2`
  color: #ffffff;
  text-align: center;
`

export default function Home() {
  /* 
    Balance > 1000 USDT
  */
  const [appid1, setAppid1] = useState<string>("629b0bc3-fdd1-4806-8c51-084bf7aa7414")
  const [value1, setValue1] = useState<string>("cb82bf53904c4c7c93bb5d9114abab33")


  /*
     Balance < 1000 USDT
  */
  const [appid2, setAppid2] = useState<string>("629b0bc3-fdd1-4806-8c51-084bf7aa7414")
  const [value2, setValue2] = useState<string>("6fa9de1c14a94179b1054b0049c36431")


  const [value3, setValue3] = useState<string>("762be634cfa1473eaaf374fa48504886")

  const [result, setResult] = useState<any>()
  const [result2, setResult2] = useState<any>()

  const start = async (schemas: string[], appid: string) => {
    try {
      const connector = new TransgateConnect(appid)

      const isAvailable = await connector.isTransgateAvailable()
      if (!isAvailable) {
        return alert("Please install zkPass TransGate")
      }



      //@ts-ignore
      if (window.ethereum == null) {
        return alert("MetaMask not installed")
      }
      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum)
      console.log("provider", provider)
      const signer = await provider.getSigner()
      //get your ethereum address
      const account = await signer.getAddress()   
      const contractAddress = "0x8c18c0436A8d6ea44C87Bf5853F8D11B55CF0302"   


      const resultList: any[] = []
      while (schemas.length > 0) {
        const schemaId = schemas.shift() as string
        const res: any = await connector.launch(schemaId)
        resultList.push(res)
        const verifyResult = verifyMessageSignature(
          res.taskId,
          schemaId,
          res.uHash,
          res.publicFieldsHash,
          res.validatorSignature,
          res.validatorAddress
        )
        console.log("verifyResult", verifyResult)

        const chainParams = {
          taskId: res.taskId,
          schemaId,
          uHash: res.uHash,
          recipient: account,        
          publicFieldsHash: res.publicFieldsHash,        
          validator: res.validatorAddress,
          allocatorSignature: res.allocatorSignature,
          validatorSignature: res.validatorSignature,        
        }  
        

      //  const contract = new ethers.Contract(contractAddress, AttestationABI, provider)      
      // const data = contract.interface.encodeFunctionData("attest", [chainParams])
      // console.log("damn 2");
      // let transaction = {
      //   to: contractAddress,
      //   from: account,
      //   value: 0,
      //   data,
      // }
      // // console.log("transaction", transaction)
      // let tx = await signer?.sendTransaction(transaction)
      // console.log("transaction hash====>", tx.hash)
      // alert('Transaction sent successfully!')

      }
      if (resultList.length == 1) {
        setResult(resultList)
      } else {
        setResult2(resultList)
      }
    } catch (err) {
      alert(JSON.stringify(err))
      console.log("error", err)
    }
  }


  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Create Your ZK Pass to Access the Benefits of Lighter.xyz</h1>
      <FormGrid>
        <FromContainer>

        <FormItem>
          <p className={styles.subTitle}>Have you completed kyc on centralised exchange?</p>
            <RightContainer>
              <Button className={styles.button}  onClick={() => start([value1], appid1)}>Verify here! </Button>
            </RightContainer>
          </FormItem>
          
          <FormItem>
          <p className={styles.subTitle}>Are you holding 1 million $ in your account?</p>
            <RightContainer>
              <Button className={styles.button}  onClick={() => start([value1], appid1)}>Whale, Verify here! </Button>
            </RightContainer>
          </FormItem>

          <FormItem>
          <p className={styles.subTitle}>Are you holding less then 1000 $ in your account?</p>
            <RightContainer>
              <Button className={styles.button}  onClick={() => start([value2], appid2)}>Retail Trader, Verify here! </Button>
            </RightContainer>
          </FormItem>

          <FormItem>
            {result && <JSONPretty className={styles.customJsonPretty} id='json-pretty' data={result}></JSONPretty>}
          </FormItem>
        </FromContainer>
        {/* <FromContainer>
          <FormItem>
            <Label>Appid:</Label>
            <Input value={appid2} onInput={(e) => setAppid2(e.target.value)} />
          </FormItem>
          <FormItem>
            <Label>Schema Id1:</Label>
            <Input value={value2} onInput={(e) => setValue2(e.target.value)} />
          </FormItem> 
           <FormItem>
            <Label>Schema Id2:</Label>
            <Input value={value3} onInput={(e) => setValue3(e.target.value)} />
          </FormItem> 
           <FormItem>
            <RightContainer>
              <Button onClick={() => start([value2, value3], appid2)}>Start multi-schemas</Button>
            </RightContainer>
          </FormItem> 
          <FormItem>
            {result2 && <JSONPretty themeClassName='custom-json-pretty' id='json-pretty1' data={result2}></JSONPretty>}
          </FormItem>
        </FromContainer> */}
      </FormGrid>
    </main>
  )
}
