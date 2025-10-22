 

 import {create} from "zustand";
import OrderDetails from "../components/OrderDetails";

// amount: "132633.1263";
// closingReason: "Automatic";
// entryPrice: "107831.81";
// exitPrice: "";
// id: "61";
// orderClosedAt: "";
// orderCreatedAt: "2025-10-22T07:19:17.339Z";
// pnl: "72.84060000000143";
// position: "Long";
// quantity: "1.23";
// status: "Open";
// stopLoss: "";
// takeProfit: "10840";
// type: "Market";
// updatedAt: "2025-10-22T07:19:17.339Z";
// userId: "8ff01e0d-f71d-4247-869f-01fa81bcc3bb";


type PositionType = "Long" | "Short";
type OrderStatus = "Open" | "Closed";
type ClosingReasonType = "Automatic" | "Manual";
type OrderExecutionType = "Market" | "Limit";

export interface OrderTypeProp {
   id: string;
   userId: string;
   amount: string;
   quantity: string;
   type: OrderExecutionType;
   position: PositionType;
   status: OrderStatus;
   pnl?: string | null;
   takeProfit?: string | null;
   stopLoss?: string | null;
   entryPrice: string;
   exitPrice: string | null;
   closingReason: ClosingReasonType;
   orderCreatedAt: string;
   orderClosedAt: string | null;
   updatedAt: string;
}

interface OrderStoreType {
   orderDetails: Map<string,OrderTypeProp>;
   addOrder: (orders: OrderTypeProp) => void; 
}



const useOrder = create<OrderStoreType>((set)=>({
   orderDetails: new Map(),
   addOrder: (order:OrderTypeProp) =>
      set((state) => {
         const updated = new Map(state.orderDetails); 
         updated.set(order.id, order);

         return { orderDetails: updated };
      }),

}))

export default useOrder;