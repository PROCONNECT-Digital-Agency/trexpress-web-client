import PhoneInput, {formatPhoneNumberIntl} from "react-phone-number-input";
import React, {useContext, useRef, useState} from "react";
import {Button} from "antd";
import Loader4LineIcon from "remixicon-react/Loader4LineIcon";
import serviceWithOutToken from "../../services/auth";
import {BASE_URL} from "../../api/main/BASE_URL";
import {setCookie} from "nookies";
import {toast} from "react-toastify";
import {useRouter} from "next/router";
import {MainContext} from "../../utils/contexts/MainContext";


export default function SignInForm2(){
    // const ref = useRef(null);
    const { getUser } = useContext(MainContext);


    const [phone, setPhone]=useState();

    const [verifyId, setVerifyId]=useState(undefined);

    const [verifyCode, setVerifyCode]=useState("");

    const router = useRouter();

    console.log(verifyId);

    console.log(verifyId);


    const onFinish = (event) => {
        event.preventDefault();
        const readyPhone = phone&&phone.substr(1).replace(/\s/g, "");
        console.log(readyPhone);

        if (verifyId===undefined){
            serviceWithOutToken.post("/api/v1/auth/forgot/password", {phone:readyPhone})
                .then((res)=>{
                    setVerifyId(res.data.data.verifyId);
                })
                .catch((error)=>{})
                .finally(()=>{
                });
            return;
        }


            serviceWithOutToken
                .post("/api/v1/auth/verify/phone", {verifyId:verifyId, verifyCode:verifyCode})
                .then((res) => {
                    console.log(res.data.data.token);
                    setCookie(null, "access_token", res.data.data.token, {
                        maxAge: 30 * 24 * 60 * 60,
                        path: "/",
                    });
                    getUser();
                    router.push("/")
                })
                .catch((error) => {
                    console.log(error);
                    toast.error(error.response.data.message, {
                        position: "top-right",
                    });
                })
                .finally(() => {
                });



    };

    return (
        <>
            <div>
                <form onSubmit={(event) => onFinish(event)}
                    style={{display:"flex", flexDirection:"column", gap:"8px"}}>

                    <PhoneInput
                        // ref={ref}
                        // labels={en}
                        placeholder="Phone number"
                        // defaultCountry="RU"
                        value={phone}
                        onChange={(phone) => {
                            setPhone(() => {
                                setPhone(formatPhoneNumberIntl(phone));
                            });
                        }}
                        // onChange={onChange}
                    />



                    {verifyId&&
                    <input minLength={6} value={verifyCode} onChange={(event)=>setVerifyCode(event.target.value)}
                        style={{
                        border: "1px solid black", padding:"14px", borderRadius:"10px", fontSize:"18px"
                    }}/>
                    }

                    <button
                        className={"sign-in-btn"}
                        align={"center"}
                        style={{
                            backgroundColor:"blue",
                            padding:"8px",
                            borderRadius:"10px",
                            color: "#fff !important"
                        }}
                    >
                        Login
                    </button>
                </form>
            </div>
        </>
    );

}