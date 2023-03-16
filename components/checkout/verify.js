import axios from "axios";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MessageInput from "../form/msg-input";
import Ordered from "../products/ordered";
import { useSelector, useDispatch } from "react-redux";
import SupplierVerify from "../order/SupplierVerify";
import { OrderApi } from "../../api/main/order";
import { clearCart, clearOrderShops } from "../../redux/slices/cart";
import { addNote, clearOrder } from "../../redux/slices/order";
import { TransactionsApi } from "../../api/main/transactions";
import { toast } from "react-toastify";
import { MainContext } from "../../utils/contexts/MainContext";
import { getPrice } from "../../utils/getPrice";
import { useState } from "react";
import Paystack from "../payment/paystack";
import MyRazorpay from "../payment/razorpay";
import { CashbackApi } from "../../api/main/cashback";

const Verify = ({
  setCheckoutContent,
  setStepKey,
  setOrderId,
  pay,
  payment,
  atmosToken
}) => {
  const { t: tl } = useTranslation();
  const { getUser } = useContext(MainContext);
  const [orderedData, setOrderedData] = useState({});
  const [cashback, setCashback] = useState(0);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const order = useSelector((state) => state.order);
  const getGroupById = (flattenExtras = []) => {
    let result = [];
    flattenExtras.forEach((r) => {
      if (!result[r.shop.id]) {
        result[r.shop.id] = [];
      }
      result[r.shop.id].push(r);
    });
    return result;
  };
  const showProduct = getGroupById(cart.cartItems).filter(
    (item) => item.length > 0
  );
  const getFinnalyCheck = () => {
    let totalDiscount = 0;
    let total_price = 0;
    let totalTax = 0;
    let shopTax = 0;
    let deliveryFee = order.shops.reduce(
      (old, newd) => old + newd.delivery_fee,
      0
    );

    showProduct.forEach((item) => {
      item.forEach((data) => {
        if (data.stockId.discount) {
          totalDiscount += data.stockId.discount * data.qty;
        }
        total_price += data.total_price - data.productTax;
        totalTax += data.productTax;
        shopTax += data.shop_tax;
      });
    });
    return { totalDiscount, total_price, totalTax, shopTax, deliveryFee };
  };
  const calculateCashback = () => {
    CashbackApi.create({ amount: order?.data?.total })
      .then((res) => {
        setCashback(res.data.price);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    setStepKey("verify-order");
    calculateCashback();
  }, []);

  const createOrder = () => {
    if (payment?.id) {
      OrderApi.create({
        ...order.data,
        shops: order.shops,
      })
        .then(async (res) => {
          setOrderedData(res.data);
          setOrderId(res.data.id);
          if (payment.tag === "cash" || payment.tag === "wallet") {
            TransactionsApi.create(res.data.id, {
              payment_sys_id: payment.id,
            })
              .then(() => {
                dispatch(clearOrderShops());
                dispatch(clearCart());
                dispatch(clearOrder());
                setCheckoutContent("status");
              })
              .catch((error) => {
                console.error(error);
              })
              .finally(() => {
                if (payment.tag === "wallet") getUser();
              });
          } else if (payment.tag === "paypal" || payment.tag === "stripe") {
            pay({ createdOrderData: res.data });
          } else if (payment.card_id) {
            try {
              const txCreateRes = await axios.post(
                "https://partner.paymo.uz/merchant/pay/create",
                {
                  amount: res.data.price * 100,
                  account: res.data.id,
                  store_id: 1112
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${atmosToken}`,
                    Accept: "application/json",
                  }
                }
              );

              if (txCreateRes.data.result.code != 'OK') {
                throw txCreateRes.data.result;
              }

              await TransactionsApi.create(res.data.id, {
                payment_sys_id: 7,
                payment_trx_id: txCreateRes.data.transaction_id
              });

              const txPreconfirmRes = await axios.post(
                "https://partner.paymo.uz/merchant/pay/pre-confirm",
                {
                  card_token: payment.card_token,
                  store_id: 1112,
                  transaction_id: txCreateRes.data.transaction_id
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${atmosToken}`,
                    Accept: "application/json",
                  }
                }
              );

              if (txPreconfirmRes.data.result.code != 'OK') {
                throw txPreconfirmRes.data.result;
              }

              const txConfirmRes = await axios.post(
                "https://partner.paymo.uz/merchant/pay/confirm",
                {
                  otp: "111111",
                  store_id: 1112,
                  transaction_id: txCreateRes.data.transaction_id
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${atmosToken}`,
                    Accept: "application/json",
                  }
                }
              );

              if (txConfirmRes.data.result.code != 'OK') {
                throw txConfirmRes.data.result;
              }

              dispatch(clearOrderShops());
              dispatch(clearCart());
              dispatch(clearOrder());
              setCheckoutContent("status");
            } catch(error) {
              console.error(error);
              toast.error(error.description || error.response?.data?.message);
            }
          }
        })
    } else {
      toast.error("Plese select payment type");
    }
  };
  const { totalDiscount, total_price, totalTax, shopTax, deliveryFee } =
    getFinnalyCheck();

  return (
    <div className="tab-pane">
      <div className="title">{tl("Verify order")}</div>
      <div className="verify">
        <div className="left">
          <div className="total-amoun-wrapper">
            <div className="total-amount">
              <div className="amount-item">
                <div className="key">{tl("Total product price")}</div>
                <div className="value">
                  {getPrice(total_price + totalDiscount)}
                </div>
              </div>
              <div className="amount-item">
                <div className="key">{tl("Discount")}</div>
                <div className="value">{getPrice(totalDiscount)}</div>
              </div>
              <div className="amount-item">
                <div className="key">{tl("VAT Tax")}</div>
                <div className="value">{getPrice(totalTax)}</div>
              </div>
              <div className="amount-item">
                <div className="key">{tl("Shop Tax")}</div>
                <div className="value">{getPrice(shopTax)}</div>
              </div>
              <div className="amount-item">
                <div className="key">{tl("Delivery Fee")}</div>
                <div className="value">{getPrice(deliveryFee)}</div>
              </div>
              {order?.coupon?.price && (
                <div className="amount-item">
                  <div className="key">{tl("Coupon")}</div>
                  <div className="value">{getPrice(order?.coupon.price)}</div>
                </div>
              )}
              {cashback > 0 && (
                <div className="amount-item">
                  <div className="key">{tl("Cashback")}</div>
                  <div className="value">{getPrice(cashback)}</div>
                </div>
              )}
              <span></span>
              <div className="amount-item">
                <div className="key">{tl("Total amount")}</div>
                <div className="value">
                  {getPrice(
                    total_price +
                      totalTax +
                      shopTax +
                      deliveryFee -
                      (order?.coupon?.price ? order?.coupon?.price : 0)
                  )}
                </div>
              </div>
            </div>
          </div>
          <MessageInput onChange={(e) => dispatch(addNote(e.target.value))} />
        </div>
        <div className="right">
          <div className="title">{tl("Your order")}</div>
          <div className="content">
            <div className="products-lists">
              {showProduct?.map((product, key) => {
                return (
                  <div key={key} className="product-list-item">
                    {product.map((orderedProduct, key) => {
                      return (
                        <Ordered key={key} orderedProduct={orderedProduct} />
                      );
                    })}
                    <SupplierVerify shop={product[0].shop} products={product} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 50 }} className="btn-group">
        <button
          className="btn-dark"
          onClick={() => setCheckoutContent("payment-method")}
        >
          {tl("Back")}
        </button>

        {payment?.tag === "paystack" ? (
          <Paystack
            createdOrderData={orderedData}
            createOrder={createOrder}
            payment={payment}
            setCheckoutContent={setCheckoutContent}
          />
        ) : payment?.tag === "razorpay" ? (
          <MyRazorpay
            createdOrderData={orderedData}
            order={order}
            setCheckoutContent={setCheckoutContent}
            payment={payment}
            setOrderId={setOrderId}
          />
        ) : (
          <button onClick={createOrder} className="btn-success">
            {tl("Pay")}
          </button>
        )}
      </div>
    </div>
  );
};

export default Verify;
