import { useRef } from "react";
import usePrice from "../store/usePrice";



// component which will show the latest price of the stock
function StockPrice() {
   const tokenPrice=usePrice((state)=>state.tokenPrice)
   const previousValueIndicator=usePrice((state)=>state.previousValueIndicator);
   return ( 
      <div className="text-xl">
         BTC <span className={`${previousValueIndicator ? "text-green-500":"text-red-500"}`}>{tokenPrice}</span>
      </div>
    );
}

export default StockPrice;