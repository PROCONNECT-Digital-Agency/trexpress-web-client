import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import MapPinLineIcon from "remixicon-react/MapPinLineIcon";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import EqualizerFillIcon from "remixicon-react/EqualizerFillIcon";
import FileListFillIcon from "remixicon-react/FileListFillIcon";
import Store3FillIcon from "remixicon-react/Store3FillIcon";
import ArrowLeftSLineIcon from "remixicon-react/ArrowLeftSLineIcon";
import SerachResult from "./search-result";
import { MainContext } from "../../utils/contexts/MainContext";
import FilterContent from "./filter-content";
import useDebounce from "../../utils/hooks/useDebounce";
import serviceWithOutToken from "../../services/auth";
import { imgBaseUrl } from "../../constants";
import { useTranslation } from "react-i18next";
import FlashlightFillIcon from "remixicon-react/FlashlightFillIcon";
import { ArrowRigthIcon, CheeseLineIcon } from "../../constants/images";
import Category from "../category";
import SelectAddress from "../form/select-address";
const SerachFilter = ({ className }) => {
  const { t: tl } = useTranslation();
  const router = useRouter();
  const { isOpen, setIsOpen, shop } = useContext(MainContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  function searchProduct(search) {
    return serviceWithOutToken(`/api/v1/rest/products/paginate`, {
      params: { search, perPage: 50 },
    })
      .then((r) => r.data)
      .catch((error) => {
        console.error(error);
        return [];
      });
  }

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      searchProduct(debouncedSearchTerm).then((results) => {
        setIsSearching(false);
        setSearchResult(results);
      });
    } else {
      setSearchResult([]);
    }
  }, [debouncedSearchTerm]);

  const handleClick = (key) => {
    setIsOpen(key);
  };
  useEffect(() => {
    setSearchTerm("");
  }, [isOpen]);

  return (
    <>
      <div
        className={
          isOpen === "search"
            ? "filter-wrapper search-visible"
            : isOpen === "filter"
            ? "filter-wrapper filter-visible"
            : "filter-wrapper"
        }
      >
        <div className="search-input-wrapper">
          <div className={`search-filter ${className}`}>
            <Search2LineIcon size={20} onClick={() => handleClick("search")} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => handleClick("search")}
              placeholder={tl("Search products")}
            />

            {searchResult?.data && (
              <div className="search-result-count">
                {searchResult?.data?.length}
              </div>
            )}
            {(router.route === "/stores/[id]/news" ||
              router.route === "/stores/[id]/top-sales" ||
              router.route === "/stores/[id]/sales" ||
              router.route === "/stores/[id]/all-product") && (
              <EqualizerFillIcon
                className="filter-icon"
                onClick={() => handleClick("filter")}
                size={20}
              />
            )}
            <SerachResult
              isSearching={isSearching}
              searchResult={searchResult}
              setSearchTerm={setSearchTerm}
              setIsOpen={setIsOpen}
            />
          </div>
        </div>
        <div className="filter-links"></div>
        <SelectAddress />
      </div>
    </>
  );
};
const getButton = (tl, router) => {
  const pathname = router.pathname;
  if (pathname === "/") {
    return (
      <Link href="/view-in-map">
        <a className="btn-view">
          <MapPinLineIcon size={20} />
          <span>{tl("View in map")}</span>
        </a>
      </Link>
    );
  } else if (pathname === "/view-in-map") {
    return (
      <Link href="/">
        <a className="btn-view">
          <FileListFillIcon size={20} />
          <span>{tl("View in List")}</span>
        </a>
      </Link>
    );
  } else if (pathname === "/stores/[id]") {
    return (
      <Link href="/">
        <a className="btn-view bg-white">
          <Store3FillIcon size={20} />
          <span>{tl("Back all store")}</span>
        </a>
      </Link>
    );
  } else {
    return (
      <div onClick={() => router.back()} className="btn-view bg-white">
        <ArrowLeftSLineIcon size={20} />
        <span>{tl("Back")}</span>
      </div>
    );
  }
};
export default SerachFilter;
