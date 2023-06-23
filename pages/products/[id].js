import React, { useContext, useEffect, useState } from "react";
import nookies from "nookies";
import CustomDrawer from "../../components/drawer";
import ImgMagnify from "../../components/products/detail/img-magnify";
import ProductData from "../../components/products/detail/product-data";
import ProductRate from "../../components/products/detail/rate";
import Heart3LineIcon from "remixicon-react/Heart3LineIcon";
import Heart3FillIcon from "remixicon-react/Heart3FillIcon";
import StarSmileFillIcon from "remixicon-react/StarSmileFillIcon";
import Message2FillIcon from "remixicon-react/Message2FillIcon";
import { useTranslation } from "react-i18next";
import axiosService from "../../services/axios";
import { useSelector, useDispatch } from "react-redux";
import { addToSaved, removeFromSaved } from "../../redux/slices/savedProduct";
import ProductSection from "../../components/products/section";
import ProductCard from "../../components/products/card";
import Empty from "../../components/empty-data";
import { images } from "../../constants/images";
import { MainContext } from "../../utils/contexts/MainContext";
import { ProductApi } from "../../api/main/product";
import useWindowSize from "../../utils/hooks/useWindowSize";
import SEO from "../../components/seo";
import ProductLoader from "../../components/loader/product";
import ReactHTMLParser from 'react-html-parser';
const ProductDetail = ({ productData }) => {
  const windowSize = useWindowSize();
  const { t: tl } = useTranslation();
  const { setDrawerTitle } = useContext(MainContext);
  const [open, setOpen] = useState(null);
  const [data, setData] = useState(productData);
  const [relatedProduct, setRelatedProduct] = useState(null);
  const [targetImgExtra, setTargetImgExtra] = useState([]);
  const dispatch = useDispatch();

  const likedProducts = useSelector(
    (state) => state.savedProduct.savedProductList
  );
  const viewedProduct = useSelector(
    (state) => state.viewedProduct.viewedProductList
  );
  const isLiked = likedProducts.find((lp) => lp.id === data?.id);

  const getProduct = (uuid) => {
    ProductApi.getId(uuid)
      .then((res) => {
        setData(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const click = () => {
    setOpen(true);
    setDrawerTitle("Write a feedback");
  };

  const getRelatedProduct = () => {
    ProductApi.get({
      brand_id: productData?.brand_id,
      category_id: productData?.category_id,
      perPage: 3,
    })
      .then((res) => {
        setRelatedProduct(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    setData(productData);
  }, [productData.id]);

  useEffect(() => {
    getRelatedProduct();
  }, []);

  const targetImg = targetImgExtra.find(
    (item) => item?.group?.type === "image"
  );

  return (
    <>
      <SEO
        title={productData?.translation?.title}
        description={productData?.translation?.description}
        keywords={productData?.translation?.description}
      />
      <div className="product-detail">
        <div className="detail-header">
          <div className="product-name">{data.translation.title}</div>
          <div className="left">
            <div className="reviews">
              <StarSmileFillIcon size={18} color="#FFB800" />
              {`${data?.rating_avg ? data?.rating_avg?.toFixed(1) : 0} (${
                data?.reviews_count ? data.reviews_count : 0
              } ${tl("reviews")})`}
            </div>
            <div className="add-comment" onClick={click}>
              <Message2FillIcon size={16} />
              {tl("Add comment")}
            </div>
            {isLiked ? (
              <div
                className="liked"
                onClick={() => dispatch(removeFromSaved(data))}
              >
                <Heart3FillIcon size={24} />
              </div>
            ) : (
              <div className="liked" onClick={() => dispatch(addToSaved(data))}>
                <Heart3LineIcon size={24} />
              </div>
            )}
          </div>
        </div>
        <div className="detail-content">
          <div className="magnify-wrapper">
            <ImgMagnify targetImg={targetImg} galleries={data.galleries} />
            <div className="store-description">
              <div className="description">
                <div className="title">{tl("Description")}</div>
                {ReactHTMLParser(data.translation.description)}
              </div>
              <div className="information">
                <div className="items">
                  <div className="title">{tl("Additional information")}</div>
                  {data.properties?.map((item, key) => (
                    <div
                      key={key}
                      className={
                        item?.value?.length > 28 ? "item column" : "item"
                      }
                    >
                      <div className="key">{item.key}</div>
                      <div className="value link">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {windowSize.width > 768 && (
              <>
                <ProductSection title="Releted products">
                  {relatedProduct ? (
                    relatedProduct
                      .filter((item) => item.id !== productData.id)
                      .map((product, key) => (
                        <ProductCard key={key} product={product} />
                      ))
                  ) : (
                    <>
                      <ProductLoader />
                      <ProductLoader />
                      <ProductLoader />
                    </>
                  )}
                  {relatedProduct?.length < 2 && (
                    <Empty
                      image={images.ViewedProduct}
                      text1="There are no items in the related products"
                    />
                  )}
                </ProductSection>
                <ProductSection
                  title="Viewed products"
                  href="/stores/viewed-product"
                >
                  {viewedProduct.length > 0 ? (
                    viewedProduct
                      .slice(0, 3)
                      .map((product, key) => (
                        <ProductCard key={key} product={product} />
                      ))
                  ) : (
                    <Empty
                      image={images.ViewedProduct}
                      text1="There are no items in the viewed products"
                      text2="To select items, go to the stores"
                    />
                  )}
                </ProductSection>
              </>
            )}
          </div>
          <div className="product-data-wrapper">
            <ProductData
              product={data}
              setOpen={setOpen}
              setTargetImgExtra={setTargetImgExtra}
              properties={data.properties}
              description={data.translation.description}
            />
          </div>
        </div>
        <CustomDrawer open={open} setOpen={setOpen}>
          <ProductRate
            getProduct={getProduct}
            setOpen={setOpen}
            uuid={data.uuid}
          />
        </CustomDrawer>
      </div>
    </>
  );
};
export async function getServerSideProps(ctx) {
  const { query } = ctx;
  const cookies = nookies.get(ctx);
  const currency_id = cookies?.currency_id;
  const language_id = cookies?.language_id;
  const language_locale = cookies?.language_locale;
  const res = await axiosService.get(`/api/v1/rest/products/${query.id}`, {
    params: { currency_id, language_id, lang: language_locale },
  });
  const productData = await res.data.data;
  return { props: { productData } };
}
export default ProductDetail;
