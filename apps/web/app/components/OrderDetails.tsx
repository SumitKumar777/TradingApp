// * order object comming from the websocket

"use client";
import { useState } from "react";
import ClosedOrder from "./CloseOrder";
import OpenOrder from "./OpenOrder";
import { Button } from "@/components/ui/button";

function OrderDetails() {
  const [orderState, setOrderState] = useState(true);
  return (
    <div className="pt-4">
      <div className="border-2 text-xl flex gap-2 ">
        <Button
          className={`${orderState ? "bg-gray-600" : "bg-gray-500"} p-6 text-xl `}
          onClick={() => {
            if (!orderState) {
              setOrderState(true);
            }
          }}
        >
          Open Orders
        </Button>
        <Button
          className={`${!orderState ? "bg-gray-700" : "bg-gray-500"} p-6 text-xl `}
          onClick={() => {
            if (orderState) {
              setOrderState(false);
            }
          }}
        >
          closed Order
        </Button>
      </div>
      <div className=" w-full pt-2">
        {orderState ? <OpenOrder /> : <ClosedOrder />}
      </div>
    </div>
  );
}

export default OrderDetails;
