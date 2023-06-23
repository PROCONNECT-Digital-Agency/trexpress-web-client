import React, { useContext } from "react";
import InformationLineIcon from "remixicon-react/InformationLineIcon";
import TruckLineIcon from "remixicon-react/TruckLineIcon";
import Bookmark3LineIcon from "remixicon-react/Bookmark3LineIcon";
import StarLineIcon from "remixicon-react/StarLineIcon";
import { imgBaseUrl } from "../../constants";
import { addToSaved, removeFromSaved } from "../../redux/slices/savedStore";
import { useDispatch, useSelector } from "react-redux";
import { MainContext } from "../../utils/contexts/MainContext";
import { useTranslation } from "react-i18next";

const LgBanner = ({ handleContent, data }) => {
  const { t: tl } = useTranslation();
  const dispatch = useDispatch();
  const savedStores = useSelector((state) => state.savedStore.savedStoreList);
  const savedStore = savedStores.find((store) => store.id === data?.id);
  const { setDrawerTitle } = useContext(MainContext);
  const saved = () => {
    if (savedStore?.id === data?.id) {
      dispatch(removeFromSaved(data));
    } else {
      dispatch(addToSaved(data));
    }
  };
  const click = ({ title, key }) => {
    setDrawerTitle(title);
    handleContent(key);
  };
  return (
    <div className="banner-lg">
      <img
        className="banner-lg-img"
        src={imgBaseUrl + data.background_img}
        alt="Baner"
      />
      <div className="logo">
        <img src={imgBaseUrl + data.logo_img} />
      </div>
      <div className="banner-lg-footer">
        <div className="store-name">{data.translation?.title}</div>
        <div
          className="reaction"
          onClick={() => click({ key: "store-info", title: tl("Store info") })}
        >
          <InformationLineIcon size={20} />
          <span>{tl("Store info")}</span>
        </div>
        <div
          className="reaction"
          onClick={() =>
            click({ key: "delivery-time", title: tl("Delivery time") })
          }
        >
          <TruckLineIcon size={20} />
          <span>{tl("Delivery time")}</span>
        </div>
        <div className="reaction" onClick={saved}>
          <Bookmark3LineIcon size={20} color={savedStore && "#61DC00"} />
          <span>{tl("Saved")}</span>
        </div>
        <div className="reaction">
          <StarLineIcon size={20} />
          <span>
            {data.rating_avg ? parseInt(data.rating_avg).toFixed(1) : "0.0"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LgBanner;
