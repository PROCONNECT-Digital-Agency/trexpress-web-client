import React, { useContext, useEffect, useState } from "react";
import { SaleIcon, StockIcon } from "../../../constants/images";
import Message2FillIcon from "remixicon-react/Message2FillIcon";
import StarSmileFillIcon from "remixicon-react/StarSmileFillIcon";
import AddLineIcon from "remixicon-react/AddLineIcon";
import SubtractLineIcon from "remixicon-react/SubtractLineIcon";
import Slider from "rc-slider";
import Rating from "react-rating";
import Accordion from "../../accordion";
import AccordionSummary from "../../accordion/accordion-summary";
import AccordionDetails from "../../accordion/accordion-details";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decreaseCart, getTotals } from "../../../redux/slices/cart";
import { imgBaseUrl } from "../../../constants";
import { toast } from "react-toastify";
import { MainContext } from "../../../utils/contexts/MainContext";
import { useTranslation } from "react-i18next";
import { getPrice } from "../../../utils/getPrice";
import ReactHTMLParser from 'react-html-parser';
const ProductData = ({
  setOpen,
  product,
  setTargetImgExtra,
  properties,
  description,
}) => {
  const { t: tl } = useTranslation();
  const { setDrawerTitle, setShop } = useContext(MainContext);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [idList, setIdList] = useState([]);
  const [extras, setExtras] = useState([]);
  const [reviewCount, setReviewCount] = useState(3);
  const [stock, setStock] = useState([]);
  const [showExtras, setShowExtras] = useState([]);
  const [extrasIds, setExtrasIds] = useState([]);
  const targetProductImg = extrasIds.find(
    (item) => item.group.type === "image"
  );
  const currentProduct = cart.cartItems.find(
    (item) => item?.stockId?.id === showExtras?.stock?.id
  );

  const handleClick = (key) => {
    const includes = idList.includes(key);
    if (includes) {
      setIdList(idList.filter((item) => item !== key));
    } else {
      setIdList([...idList, key]);
    }
  };
  const handelAddToCart = () => {
    dispatch(
      addToCart({
        product_id: product.id,
        id: showExtras?.stock.id,
        translation: product.translation,
        extras: extrasIds,
        img: targetProductImg ? targetProductImg.value : product.img,
        stockId: showExtras?.stock,
        min_qty: product.min_qty,
        max_qty: product.max_qty,
        tax: product.tax,
        price: showExtras?.stock.price,
        shop_tax: product.shop.tax,
        discount: showExtras?.stock.discount ? showExtras?.stock.discount : 0,
        stocks: product.stocks,
        shop: {
          id: product.shop.id,
          translation: product.shop.translation,
          logo: product.shop.logo_img,
          tax: product.shop.tax,
          close_time: product.shop.close_time,
          open_time: product.shop.open_time,
          location: product.shop.location,
        },
      })
    );
    dispatch(getTotals());
  };
  const handleDec = () => {
    dispatch(decreaseCart(currentProduct));
    dispatch(getTotals());
  };

  const handleInc = () => {
    if (
      currentProduct.qty >= product.max_qty ||
      currentProduct.qty >= showExtras?.stock?.quantity
    ) {
      toast.warn(
        `${tl("You can buy only")} ${
          product.max_qty > showExtras?.stock?.quantity
            ? showExtras?.stock?.quantity
            : product.max_qty
        } ${tl("products")}`
      );
    } else dispatch(addToCart(currentProduct));
    dispatch(getTotals());
  };
  function sortExtras(object) {
    var extras = [];
    var stocks = [];
    var up = "";

    for (var i = 0; i < object["stocks"].length; i++) {
      up = "";
      for (var k = 0; k < object["stocks"][i]["extras"].length; k++) {
        var extra = Object.assign({}, object["stocks"][i]["extras"][k]);
        var index = extras.findIndex((item) => item["id"] == extra["id"]);
        if (index == -1) {
          extra["level"] = k;
          extra["up"] = [up];
          extras.push(extra);
          up += extra["id"].toString();
        } else {
          extras[index]["up"].push(up);
          up += extra["id"].toString();
        }
      }
      var mdata = {
        id: object["stocks"][i]["id"],
        extras: up,
        price: object["stocks"][i]["price"],
        quantity: object["stocks"][i]["quantity"],
        countable_id: object["stocks"][i]["countable_id"],
        discount: object["stocks"][i]["discount"],
        total_price: object["stocks"][i]["total_price"],
      };
      stocks.push(mdata);
    }

    return {
      stock: stocks,
      extras: extras,
    };
  }
  function getExtras(extrasIdsArray, extras, stocks) {
    var splitted = extrasIdsArray == "" ? [] : extrasIdsArray.split(",");
    var result = [];
    var up = [];
    for (var i = 0; i <= splitted.length; i++) {
      if (i - 1 >= 0) up[up.length] = splitted[i - 1].toString();
      var filtered = extras.filter((item) => {
        var mySet = new Set(item["up"]);
        if (mySet.has(up.join(""))) return item;
      });
      if (filtered.length > 0) result.push(filtered);
    }
    var i = 0;
    if (up.length < result.length)
      while (i < extras.length) {
        up[up.length] = result[result.length - 1][0]["id"].toString();
        var filtered = extras.filter((item) => {
          var mySet = new Set(item["up"]);
          if (mySet.has(up.join(""))) return item;
        });
        if (filtered.length == 0) {
          //up.pop();
          break;
        }
        result.push(filtered);
        i++;
      }
    var index = stocks.findIndex((item) => item["extras"] == up.join(""));
    return {
      stock: stocks[index],
      extras: result,
    };
  }
  useEffect(() => {
    const myData = sortExtras(product);
    setExtras(myData.extras);
    setStock(myData.stock);
    setShowExtras(getExtras("", myData.extras, myData.stock));
    getExtras("", myData.extras, myData.stock).extras?.forEach((element) => {
      setExtrasIds((prev) => [...prev, element[0]]);
      setTargetImgExtra((prev) => [...prev, element[0]]);
    });
    setShop(product.shop);
  }, [product]);

  console.log(showExtras);

  const handleExtrasClick = (e) => {
    const index = extrasIds.findIndex(
      (item) => item.extra_group_id === e.extra_group_id
    );
    const array = extrasIds;
    if (index > -1) array = array.slice(0, index);
    array.push(e);
    const nextIds = array.map((item) => item.id).join(",");
    var extrasData = getExtras(nextIds, extras, stock);
    setShowExtras(extrasData);
    extrasData.extras?.forEach((element) => {
      const index = extrasIds.findIndex((item) =>
        element[0].extra_group_id != e.extra_group_id
          ? item.extra_group_id === element[0].extra_group_id
          : item.extra_group_id === e.extra_group_id
      );
      if (element[0].level >= e.level) {
        var itemData =
          element[0].extra_group_id != e.extra_group_id ? element[0] : e;
        if (index == -1) array.push(itemData);
        else {
          array[index] = itemData;
        }
      }
    });
    setExtrasIds(array);
    setTargetImgExtra(array);
  };
  const click = () => {
    setOpen(true);
    setDrawerTitle("Write a feedback");
  };
  const getRating = (key) => {
    return product?.rating_percent[key]?.toFixed(1);
  };
  return (
    <div className="product-data">
      <div className="color-size">
        <div className="price">
          {showExtras?.stock?.discount ? (
            <>
              <div className="current-price">
                {getPrice(
                  showExtras?.stock?.price - showExtras?.stock?.discount
                )}
              </div>
              <div className="old-price">
                {getPrice(showExtras?.stock?.price)}
              </div>
              <div className="discount">
                <SaleIcon />
                {`${tl("Sale")} ${(
                  (showExtras?.stock?.discount / showExtras?.stock?.price) *
                  100
                ).toFixed(1)} %`}
              </div>
            </>
          ) : (
            <div className="current-price">
              {getPrice(showExtras?.stock?.price)}
            </div>
          )}
        </div>
        {showExtras.extras?.map((item, key) => {
          return (
            <div
              key={key}
              className={
                item[0]?.group.type === "color" ? "extras color" : "extras"
              }
            >
              <div className="title">{item[0]?.group.translation.title}</div>
              <div className="items">
                {item?.map((e, key) => {
                  const isActive = extrasIds?.findIndex(
                    (item) => item.id === e.id
                  );
                if(item[0].extra_group_id === e.extra_group_id) {
                  return (
                    <div
                      key={key}
                      className={isActive >= 0 ? "item active" : "item"}
                      style={
                        e.group.type === "color" ? { background: e.value } : {}
                      }
                      onClick={() => handleExtrasClick(e)}
                    >
                      {isActive >= 0 && e.group.type !== "text" && (
                        <div className="active" />
                      )}
                      {e.group.type === "text" && <span>{e.value}</span>}
                      {e.group.type === "image" && (
                        <img src={imgBaseUrl + e.value} />
                      )}
                    </div>
                  );
                }
                })}
              </div>
            </div>
          );
        })}
        <div className="stock">
          <div>seller</div>
          <div className="inStock">
            <img src="/assets/images/inStock.png" />
            <span>{`${
              showExtras?.stock?.quantity >= 0
                ? showExtras?.stock?.quantity + tl(" in stock")
                : tl("out of stock")
            }`}</span>
          </div>
        </div>
      </div>

      {currentProduct ? (
        <div className="inc-dec">
          <button className="inc" onClick={handleDec}>
            <SubtractLineIcon />
          </button>
          <span>{`${currentProduct?.qty}  ${tl("items in cart")}`}</span>
          <button className="dec" onClick={handleInc}>
            <AddLineIcon />
          </button>
        </div>
      ) : (
        <button
          disabled={
            showExtras?.stock?.quantity >= product?.min_qty ? false : true
          }
          className="add-to-card"
          onClick={handelAddToCart}
        >
          {showExtras?.stock?.quantity >= product?.min_qty
            ? tl("Add to cart")
            : tl("out of stock")}
        </button>
      )}
      <div className="flavor-name description">
        <Accordion idList={idList} id={"description"}>
          <AccordionSummary
            handleClick={handleClick}
            idList={idList}
            id={"description"}
          >
            {tl("Description")}
          </AccordionSummary>
          <AccordionDetails>{ReactHTMLParser(description)}</AccordionDetails>
        </Accordion>
        {properties?.map((item, id) => {
          return (
            <Accordion key={id} idList={idList} id={id}>
              <AccordionSummary
                handleClick={handleClick}
                idList={idList}
                id={id}
              >
                {item.key}
              </AccordionSummary>
              <AccordionDetails>{item.value}</AccordionDetails>
            </Accordion>
          );
        })}
      </div>
      <div className="add-review">
        <div className="review-header">
          <div className="title">{tl("Reviews")}</div>
          <div className="add-comment" onClick={click}>
            <Message2FillIcon size={16} />
            {tl("Add comment")}
          </div>
        </div>
        {product.reviews.length > 0 && (
          <>
            <div className="slider">
              <div className="rate-slider">
                <div className="label">5</div>
                <Slider disabled={true} value={product?.rating_percent[5]} />
                <div className="percent">{`${
                  getRating(5) ? getRating(5) : 0
                }%`}</div>
              </div>
              <div className="rate-slider">
                <div className="label">4</div>
                <Slider disabled={true} value={product?.rating_percent[4]} />
                <div className="percent">{`${
                  getRating(4) ? getRating(4) : 0
                }%`}</div>
              </div>
              <div className="rate-slider">
                <div className="label">3</div>
                <Slider disabled={true} value={product?.rating_percent[3]} />
                <div className="percent">{`${
                  getRating(3) ? getRating(3) : 0
                }%`}</div>
              </div>
              <div className="rate-slider">
                <div className="label">2</div>
                <Slider disabled={true} value={product?.rating_percent[2]} />
                <div className="percent">{`${
                  getRating(2) ? getRating(2) : 0
                }%`}</div>
              </div>
              <div className="rate-slider">
                <div className="label">1</div>
                <Slider disabled={true} value={product?.rating_percent[1]} />
                <div className="percent">{`${
                  getRating(1) ? getRating(1) : 0
                }%`}</div>
              </div>
              <div className="final-rate">
                <Rating
                  readonly={true}
                  className="rating-star"
                  initialRating={product?.rating_avg}
                  emptySymbol={<StarSmileFillIcon />}
                  fullSymbol={<StarSmileFillIcon color="#FFB800" />}
                />
                <span> {`${product?.rating_avg?.toFixed(1)} out of 5.0`}</span>
              </div>
            </div>
            <div className="comment-items">
              {product?.reviews
                ?.slice(0, reviewCount)
                ?.sort((a, b) => b.id - a.id)
                ?.map((item, key) => {
                  return (
                    <div key={key} className="item">
                      <div className="comment-header">
                        <div className="user">
                          <div className="name">{`${item.user.firstname} ${item.user.lastname}`}</div>
                          <div className="time">{item.created_at}</div>
                        </div>
                        <div className="rate">
                          <StarSmileFillIcon size={18} color="#FFB800" />
                          <span>{item?.rating}</span>
                        </div>
                      </div>
                      <div className="example-images">
                        {item.galleries?.map((img, key) => {
                          return (
                            <img
                              key={key}
                              src={imgBaseUrl + img.path}
                              alt="product"
                            />
                          );
                        })}
                      </div>
                      <div className="comment-text">{item.comment}</div>
                    </div>
                  );
                })}
            </div>
            {product.reviews.length > 3 &&
              reviewCount < product.reviews.length && (
                <div
                  className="load-more"
                  onClick={() => setReviewCount(product.reviews.length)}
                >
                  {tl("Load more")}
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductData;
