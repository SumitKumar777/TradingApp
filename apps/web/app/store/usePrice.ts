import {create} from "zustand";

interface UsePriceStoreTypes{
   tokenPrice:number,
   setTokenPrice:(value:number)=>void
}


const usePrice= create<UsePriceStoreTypes>((set)=>({
   tokenPrice:0,
   setTokenPrice:(value:number)=>set(()=>({tokenPrice:value}))
}))

export default usePrice