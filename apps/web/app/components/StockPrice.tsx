import usePrice from "../store/usePrice";

// component which will show the latest price of the stock
function StockPrice() {
   const tokenPrice=usePrice((state)=>state.tokenPrice)
   return ( 
      <div className="bg-amber-400">
         BTC <span className="">{tokenPrice}</span>
      </div>
    );
}

export default StockPrice;