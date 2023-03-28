import React, { useContext, useState } from "react";
import Status from "../../components/be-seller/status";
import CheckoutStep from "../../components/checkout/checkout-step";
import DeliveryType from "../../components/checkout/delivery-type";
import PaymentMethod from "../../components/checkout/payment-method";
import Verify from "../../components/checkout/verify";
import CreatePayment from "../../components/payment";
import { MainContext } from "../../utils/contexts/MainContext";
import axios from "axios";
import { useDispatch } from "react-redux";
import { clearCart, clearOrderShops } from "../../redux/slices/cart";
import { clearOrder } from "../../redux/slices/order";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import SEO from "../../components/seo";
import { useEffect } from "react";
import EnterAddress from "../../components/address/enter-delivery-address";
import CustomDrawer from "../../components/drawer";
const Checkout = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [checkoutContent, setCheckoutContent] = useState("delivery-type");
  const { address, getUser, setIsOpen, checkoutAddress, setCheckoutAddress } =
    useContext(MainContext);
  const [stepKey, setStepKey] = useState("address");
  const [orderId, setOrderId] = useState(null);
  const [createdOrderData, setCreatedOrderData] = useState({});
  const [payment, setPayment] = useState(null);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [paymethod, setPaymethod] = useState("");
  const [deliveryType, setDeliveryType] = useState(null);
  const [atmosToken, setAtmosToken] = useState(null);
  const handleDrawer = (e) => {
    setOpen(e);
    dispatch(clearOrderShops());
    dispatch(clearCart());
    dispatch(clearOrder());
    router.push("/order-history");
    toast.success(
      "Your order created successfully! You can pay later on the order history page"
    );
  };
  const pay = ({ createdOrderData }) => {
    setCreatedOrderData(createdOrderData);
    setOpen(true);
    if (payment.tag === "stripe" && Object.keys(createdOrderData)?.length) {
      axios
        .post("/api/create-stripe-session", {
          amount: createdOrderData.price,
          order_id: createdOrderData.id,
        })
        .then((res) => {
          console.log(res.data);
          setData(res.data);
          setOpen(true);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  useEffect(() => {
    if (!address?.length) getUser();
  }, []);

  useEffect(() => {
    axios
      .post(process.env.API_URL + "/api/v1/payments/atmos-token")
      .then(res => { console.log(res); setAtmosToken(res.data.token)})
      .catch(error => console.error(error))
  }, []);

  return (
    <>
      <SEO />
      <div className="container checkout">
        <CheckoutStep stepKey={stepKey} checkoutContent={checkoutContent} />
        {checkoutContent === "delivery-type" && (
          <DeliveryType
            setCheckoutContent={setCheckoutContent}
            setStepKey={setStepKey}
            setDeliveryType={setDeliveryType}
          />
        )}
        {checkoutContent === "payment-method" && (
          <PaymentMethod
            setPaymethod={setPaymethod}
            address={address}
            setCheckoutContent={setCheckoutContent}
            setStepKey={setStepKey}
            setPayment={setPayment}
            deliveryType={deliveryType}
            atmosToken={atmosToken}
          />
        )}
        {checkoutContent === "verify" && (
          <Verify
            payMethod={paymethod}
            setCheckoutContent={setCheckoutContent}
            setStepKey={setStepKey}
            setOrderId={setOrderId}
            payment={payment}
            pay={pay}
            atmosToken={atmosToken}
          />
        )}
        {checkoutContent === "status" && <Status orderId={orderId} />}
        <CreatePayment
          setOpen={handleDrawer}
          closeDrawer={setOpen}
          open={open}
          data={data}
          paymentId={payment?.id}
          payment={payment}
          createdOrderData={createdOrderData}
          setCheckoutContent={setCheckoutContent}
        />
      </div>
      <CustomDrawer open={checkoutAddress} setOpen={setCheckoutAddress}>
        <EnterAddress setIsOpen={setIsOpen} setOpen={setCheckoutAddress} />
      </CustomDrawer>
    </>
  );
};

export default Checkout;
