import React, { useContext, useEffect, useState } from "react";
import LoginCircleLineIcon from "remixicon-react/LoginCircleLineIcon";

import ShoppingCartLineIcon from "remixicon-react/ShoppingCartLineIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import Link from "next/link";
import Sidebar from "../sidebar";
import CustomDrawer from "../drawer";
import MobileNav from "./mobile";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import useWindowSize from "../../utils/hooks/useWindowSize";
import { MainContext } from "../../utils/contexts/MainContext";
import UserAvatar from "./avatar";
import { parseCookies } from "nookies";
import SerachFilter from "../search-filter";
import { useRouter } from "next/router";
import { MenuList } from "./MenuList";
import { MenuList2 } from "./MenuList2";
import { Avatar, Badge } from "antd";
import Image from "next/image";
import Logo from "../../public/assets/images/lightThemeLogo.png"
const Navbar = ({ handleContent }) => {
  const { t: tl } = useTranslation();
  const router = useRouter();
  const [mobileWidth, setMobileWidth] = useState(false);
  const cookies = parseCookies();
  const [open, setOpen] = useState(null);
  const user = useSelector((state) => state.user.data);
  const settings = useSelector((state) => state.settings.data);
  const notification = useSelector((state) => state.notification.data);
  const cart = useSelector((state) => state.cart);
  const savedProduct = useSelector(
    (state) => state.savedProduct.savedProductList
  );
  const {
    notificationList,
    handleNotification,
    handleMarkAllNotification,
    setDrawerTitle,
    theme,
  } = useContext(MainContext);
  const isEmpty = Object.keys(user ? user : {}).length === 0;
  const cartTotalAmount = useSelector((state) => state.cart.cartTotalAmount);
  const windowSize = useWindowSize();
  const click = (key) => {
    setDrawerTitle("My order");
    handleContent(key);
  };
  const readed = (item) => {
    const readed = notification.includes(item.id);
    return readed;
  };

  useEffect(() => {
    document.body.clientWidth < 1200
      ? setMobileWidth(true)
      : setMobileWidth(false);
  }, [document.body.clientWidth]);

  return (
    <>
      <div className="navbar">
        <div className="left">
          {mobileWidth && (
            <div className="burger-btn" onClick={() => setOpen(true)}>
              <span></span>
              <span></span>
            </div>
          )}
          {windowSize.width > 768 && (
            <Link href="/">
              <Image
                width={160}
                height={40}
                style={{objectFit: "cover"}}
                src={Logo}
                alt="logo"
              />
            </Link>
          )}

          <SerachFilter
            className={
              router.pathname === "/products/[id]" ? "inner-store" : ""
            }
          />
        </div>
        <div className="right">
          {(isEmpty || !cookies?.access_token) && (
            <Link href="/auth/sign-in">
              <a className="login-btn">
                <LoginCircleLineIcon size={18} />
                <span>{tl("Login")}</span>
              </a>
            </Link>
          )}
          <Link href="/stores/liked-product">
            <a className="square">
              <Badge overflowCount={9} count={savedProduct.length}>
                <HeartLineIcon size={18} />
              </Badge>
              <span>{tl("Favorite")}</span>
            </a>
          </Link>
          <div className="cart-amount" onClick={() => click("order-list")}>
            <Badge overflowCount={9} count={cart.cartItems.length}>
              <ShoppingCartLineIcon size={18} />
            </Badge>
            <span>{tl("Basket")}</span>
          </div>
          <div className="login-btn">
            <UserAvatar />
          </div>
        </div>
      </div>
      <CustomDrawer
        header={false}
        open={open}
        setOpen={setOpen}
        direction="left"
        size={585}
        className="mobile-sidebar"
      >
        <Sidebar setOpen={setOpen} />
        {windowSize?.width < 769 && <MobileNav setOpen={setOpen} />}
      </CustomDrawer>
      <MenuList />
    </>
  );
};

export default Navbar;
