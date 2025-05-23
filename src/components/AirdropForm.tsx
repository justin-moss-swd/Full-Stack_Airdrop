"use client"

import InputField from "@/components/ui/InputField";
import { useMemo, useState } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amount, setAmount] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amount), [amount]);
    //useMemo(() => console.log(calculateTotal(amount)), [amount]);
    const { data: hash, isPending, writeContractAsync } = useWriteContract();

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) { 
            alert("No address found, please use a supported chain.");
            return 0;
        }

        // Read from the chain to confirm there are enough tokens approved
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`],
        })

        return response as number;
    }

    async function handleSubmit() {
        // 1a. If already approved, move to step 2
        // 1b. Approve tsender contract to send tokens
        // 2.  Call airdrop function on the tsender contract
        // 3.  Wait for the transaction to be mined

        // console.log(tokenAddress);
        // console.log(recipients);
        // console.log(amount);

        const tSenderAddress = chainsToTSender[chainId]["tsender"];
        const approvedAmount = await getApprovedAmount(tSenderAddress);
        //console.log(approvedAmount);

        if (approvedAmount < total) {
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)],
            })

            const approvalReciept = await waitForTransactionReceipt(config, {
                hash: approvalHash,
            })

            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amount.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })

            console.log("Approval Confirmed", approvalReciept);
            
        } else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amount.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        }
    }
    
    return(
        <div className="mt-4 space-y-4">
            <InputField
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)} 
                large={false}            
            />
            <InputField
                label="Recipients"
                placeholder="0x123...0x789"
                value={recipients}
                onChange={e => setRecipients(e.target.value)} 
                large={true}            
            />
            <InputField
                label="Amount"
                placeholder="100, 200, 300..."
                value={amount}
                onChange={e => setAmount(e.target.value)} 
                large={true} 
                           
            />
            <button onClick={handleSubmit} className="
                px-6 py-3
                bg-blue-600 hover:bg-blue-700
                text-white font-semibold
                rounded-lg
                shadow-sm
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled-cursor-not-allowed
            ">
                Send Tokens
            </button>
        </div>
    );
}