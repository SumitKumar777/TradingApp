import { create } from "zustand";

interface UsePriceStoreTypes {
   tokenPrice: number;
   previousValueIndicator: boolean;
   setTokenPrice: (value: number) => void;
}

const usePrice = create<UsePriceStoreTypes>((set) => ({
   tokenPrice: 0,
   previousValueIndicator: true,
   setTokenPrice: (value: number) =>
      set((state) => {
         const isDecreasing = state.tokenPrice < value;
         return {
            tokenPrice: value,
            previousValueIndicator: isDecreasing,
         };
      }),
}));

export default usePrice;
