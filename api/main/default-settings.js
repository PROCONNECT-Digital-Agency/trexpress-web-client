import serviceWithOutToken from "../../services/auth";
import { parseCookies } from "nookies";
import { setCurrency } from "../../utils/setCurrency";
import { setLanguage } from "../../utils/setLanguage";
import {BASE_URL} from "./BASE_URL";

export const getCurrency = (array = () => {}) => {
  const cookies = parseCookies();
  const currency_id = cookies.currency_id;
  serviceWithOutToken
    .get(BASE_URL+"/api/v1/rest/currencies/active")
    .then((res) => {
      array(res.data.data);
      const defaultCurrency = res.data.data.find(
        (item) => item.default === true
      );
      if (!currency_id) {
        setCurrency(defaultCurrency);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const getLanguage = (array = () => {}) => {
  const cookies = parseCookies();
  const language_id = cookies.language_id;
  serviceWithOutToken
    .get(BASE_URL+"/api/v1/rest/languages/active")
    .then((res) => {
      array(res.data.data);
      const defaultLanguage = res.data.data.find((item) => item.default === 1);
      if (!language_id) {
        setLanguage(defaultLanguage);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};
