import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FlashlightFillIcon from "remixicon-react/FlashlightFillIcon";
import { CheeseLineIcon } from "../../constants/images";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import { FreeMode, Navigation, Mousewheel } from "swiper";
import { SwiperSlide, Swiper } from "swiper/react";
import { useInView } from "react-intersection-observer";
import SkeletonInput from "../skelton/Skeleton-Input";
import { useRouter } from "next/router";
import { useContext } from "react";
import { MainContext } from "../../utils/contexts/MainContext";
import { imgBaseUrl } from "../../constants";
import axiosService from "../../services/axios";
import { SettingsContext } from "../../utils/contexts/SettingContext";

export const MenuList = () => {
  const { t: tl } = useTranslation("common");
  const [display, setDisplay] = useState("none");
  const [childrens, setChildrens] = useState([])
  const { shop } = useContext(MainContext);
  const [arr, setArr] = useState(() => {
    (async () => {
      axiosService
        .get(`https://api.trexpress.uz/api/v1/rest/categories/paginate`)
        .then((res) => setArr(res.data.data))
        .catch((err) => console.log(err));
    })();
  });

  const { ref, inView } = useInView();
  useEffect(() => {
    const prev = document.getElementsByClassName("swiper-button-prev")[0];
    inView ? (prev.style = "opacity:0") : (prev.style = "opacity:1");
  }, [inView]);

  const wids = useWindowSize();
  const wid = wids.width;

  const router = useRouter();
  const locale = router.locale;

  return (
    <div className="menuListWrapper">
      <div className="menuListContainer">
        <div className="categoriesList">
          {router.pathname === "/products/[id]" && wid > 1200 && (
            <Link href={`/stores/${shop.uuid}`}>
              {/* <div className="btn sideBtn link"> */}
              <a className="current-store">
                <div className="logo">
                  <img src={imgBaseUrl + shop?.logo_img} alt="Logo" />
                </div>
                <div className="data">
                  <div className="name">{shop?.translation?.title}</div>
                  <div className="type">{tl("Store")}</div>
                </div>
              </a>
              {/* </div> */}
            </Link>
          )}
          <Swiper
            mousewheel={true}
            scrollbar={true}
            slidesPerView={wid > 1400 ? 8 : wid > 900 ? 5 : wid < 675 && 3}
            spaceBetween={30}
            freeMode={true}
            navigation={true}
            modules={[Mousewheel, FreeMode, Navigation]}
            className="swiperCategoriesList"
          >
            {arr?.length > 0
              ? arr.map((category, index) => (
                  <SwiperSlide
                    key={category.uuid}
                    onMouseLeave={() => setDisplay("none")}
                    onMouseOver={() => {
                      setDisplay("flex")
                      setChildrens(category.children)
                    }}
                  >
                    <Link href={`/all-product?category_id=${category.id}`}>
                      <p ref={index === 0 ? ref : ""}>
                        {category.translation?.title}
                      </p>
                    </Link>
                  </SwiperSlide>
                ))
              : [1, 2, 3, 4, 6, 7, 8, 9].map((item, index) => (
                  <SwiperSlide
                    key={index}
                    onMouseLeave={() => setDisplay("none")}
                    onMouseOver={() => setDisplay("flex")}
                  >
                    <SkeletonInput />
                  </SwiperSlide>
                ))}
          </Swiper>
        </div>

        <div className="sideBtns">
          <Link href="/stores/often-buy">
            <div className="btn sideBtn link">
              <div className="label">
                <FlashlightFillIcon size={28} color="#61DC00" />
                {/* {router.pathname !== "/products/[id]" && (

                )} */}
                <p>{tl("Often buy")}</p>
              </div>
            </div>
          </Link>
          <Link href="/stores/profitable">
            <div className="btn sideBtn link">
              <div className="label">
                <CheeseLineIcon size={28} />
                <p>{tl("Advantageous")}</p>
              </div>
            </div>
          </Link>
          {router.pathname === "/products/[id]" && wid < 1200 && (
            <Link href={`/stores/${shop.uuid}`}>
              {/* <div className="btn sideBtn link"> */}
              <a className="current-store">
                <div className="logo">
                  <img src={imgBaseUrl + shop?.logo_img} alt="Logo" />
                </div>
                <div className="data">
                  <div className="name">{shop?.translation?.title}</div>
                  <div className="type">{tl("Store")}</div>
                </div>
              </a>
            </Link>
          )}
        </div>
      </div>
      <div
        onMouseOver={() => setDisplay("flex")}
        onMouseLeave={() => setDisplay("none")}
        className="skeletonBetween"
      ></div>
      <div
        onMouseOver={() => setDisplay("flex")}
        onMouseLeave={() => setDisplay("none")}
        className="menuHover"
        style={{ display: `${display}` }}
      >
        {childrens?.length > 0 &&
          childrens.map((item, index) => {
            if(item.translation) {
              return (
                  <div key={index} className="subMenuHover">
                    <Link href={`/all-product?category_id=${item.id}`} key={index}>
                      <p>{item.translation.title}</p>
                    </Link>
                  </div>
              );
            } else {
              setDisplay("none")
            }
          })}
      </div>
    </div>
  );
};

//dry
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

//tl("Often buy")
//tl("Advantageous")
