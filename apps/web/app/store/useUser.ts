import { create } from "zustand";



interface UserDetailsPropType{
   balance :number;
   setBalance:(updatedBalance:number)=>void;
}


export const  useUser=create<UserDetailsPropType>((set)=>({
   balance:0,
   setBalance:(updatedBalance:number)=>set(()=>({balance:updatedBalance}))
}))