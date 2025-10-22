

// amount
// : 
// "132633.1263"
// closingReason
// : 
// "Automatic"
// entryPrice
// : 
// "107831.81"
// exitPrice
// : 
// ""
// id
// : 
// "61"
// orderClosedAt
// : 
// ""
// orderCreatedAt
// : 
// "2025-10-22T07:19:17.339Z"
// pnl
// : 
// "497.3750999999943"
// position
// : 
// "Long"
// quantity
// : 
// "1.23"
// status
// : 
// "Open"
// stopLoss
// : 
// ""
// takeProfit
// : 
// "10840"
// type
// : 
// "Market"
// updatedAt
// : 
// "2025-10-22T07:19:17.339Z"
// userId
// : 
// "8ff01e0d-f71d-4247-869f-01fa81bcc3bb"
// [[Prototype]]
// : 
// Object

import { OrderTypeProp } from "../store/useOrder";



function OpenOrder(orderDetails:OrderTypeProp) {
   return ( 
      <>
      <div>order id {orderDetails.id}, entryPrice {orderDetails.entryPrice} , pnl {orderDetails.pnl}, position {orderDetails.position} ,takeprofit {orderDetails.takeProfit}, stopLoss {orderDetails.stopLoss} , quantity {orderDetails.quantity} , created at {orderDetails.orderCreatedAt} </div>
      </>
    );
}

export default OpenOrder;