import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/mousewheel";

// import required modules
import { FreeMode, Navigation, Mousewheel } from "swiper";
import { useRouter } from "next/router";
import { MainContext } from "../../utils/contexts/MainContext";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import SkeltonImage from "../skelton/skelton-image";
import SkeletonInput from "../skelton/Skeleton-Input";

export const BrandList = () => {
  const { ref, inView } = useInView();
  const [loading, setLoading] = useState(false);
  const [arr, setArr] = useState(() => {
    (async () => {
      axios
        .get(`https://api.trexpress.uz/api/v1/rest/brands/paginate`)
        .then((res) => setArr(res.data.data))
        .catch((err) => console.log(err));
    })();
  });
  


  const wids = useWindowSize()
  const wid = wids.width

  return (
    <div className={"bran-list"}>
      <Swiper
        mousewheel={true}
        slidesPerView={wid > 1400 ? 12 : wid > 900 ? 6 : 3}
        spaceBetween={1}
        freeMode={false}
        navigation={true}
        modules={[Mousewheel, FreeMode, Navigation]}
        className="swiperBrands"
      >
        {arr?.length > 0
          ? arr.map((el, index) => (
              <SwiperSlide key={el.uuid}>
                <div className="skeletonBrandList">
                  <a href={`/stores/all-brand/${el.id}`}>
                    {!loading && <SkeltonImage />}
                    <img
                      width={wid > 1400 ? 80 : wid > 900 ? 60 : wid > 768 ? 40 : 20}
                      height={wid > 1400 ? 80 : wid > 900 ? 60 : wid > 768 ? 40 : 20}
                      src={`https://api.trexpress.uz/storage/images/` + el.img}
                      style={{ display: loading ? "block" : "none" }}
                      onLoad={() => setLoading(true)}
                      alt="404"
                    />{" "}
                    <p className="after" ref={index === 0 ? ref : null}>
                      {el.title}
                    </p>
                  </a>
                </div>
              </SwiperSlide>
            ))
          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((el, index) => (
              <SwiperSlide key={index}>
                <div className="skeletonBrandList">
                  <SkeltonImage />
                </div>
              </SwiperSlide>
            ))}
      </Swiper>
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
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
