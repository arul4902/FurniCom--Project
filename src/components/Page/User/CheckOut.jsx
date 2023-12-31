import React, { useEffect, useState } from "react";
import { UserAuth } from "../../context/authContext";
import { updateDoc, doc, onSnapshot, arrayRemove, collection, addDoc } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { numberWithCommas } from "../../../utils/numberWithCommas";
import { v4 as uuid } from "uuid";
import AddressModal from "./AddressModal";
import ModalEditAddress from "./ModalEditAddress";
import BackPageModal from "./BackPageModal";

import "./CheckOut.css";
import addAddresImg from "../../assets/addAddress.svg";
import Logo from "../../assets/Logo.png";
import Mandiri from "../../assets/phonepay2.jpg";
import BCA from "../../assets/gpay.jpg";
import BRI from "../../assets/paypal.jpg";
import { TabTitle } from "../../../utils/tabTitlePage";
/*start*/
const CheckOut = () => {
  const [itemCheckout, setItemCheckout] = useState([]);
  const [itemCart, setItemCart] = useState([]);
  const [address, setAddress] = useState([]);
  const [ongkir, setOngkir] = useState(0);
  const [jenisKurir, setJenisKurir] = useState("");
  const [bank, setBank] = useState("");
  const [modalAddress, setModalAddress] = useState(false);
  const [modalEditAddress, setModalEditAddress] = useState(false);
  const [modalConfirmBack, setModalConfirmBack] = useState(false);
  const { user } = UserAuth();
  const unique_id = uuid().slice(0, 8);
  const navigate = useNavigate();
  TabTitle("Lalasia | Checkout");

  const kurir = [
    {
      jenis: "Regular",
      ongkir: 10000,
    },
    {
      jenis: "Express",
      ongkir: 20000,
    },
    {
      jenis: "Kargo",
      ongkir: 15000,
    },
  ];

  useEffect(() => {
    window.history.pushState(null, "", document.URL);
    window.addEventListener("popstate", () => {
      setModalConfirmBack(true);
    });
  }, []);

  useEffect(() => {
    onSnapshot(doc(db, "users", `${user?.email}`), (doc) => {
      setItemCheckout(doc.data()?.checkoutProduct);
    });
  }, [user?.email]);

  useEffect(() => {
    onSnapshot(doc(db, "users", `${user?.email}`), (doc) => {
      setItemCart(doc.data()?.cartProduct);
    });
  }, [user?.email]);

  useEffect(() => {
    onSnapshot(doc(db, "users", `${user?.email}`), (doc) => {
      setAddress(doc.data()?.address);
    });
  }, [user?.email]);

  const totalHarga = Array.isArray(itemCheckout)
    ? itemCheckout.reduce(function (result, item) {
        return result + item.qty * item.harga;
      }, 0)
    : null;

  const itemRef = doc(db, "users", `${user?.email}`);
  const checkoutDone = async () => {
    if (user?.email) {
      await addDoc(collection(db, "users", `${user?.email}`, "orderHistory"), {
        orderid: unique_id,
        dateBuy: date,
        invoice: "INV/" + `${current.getFullYear()}/` + invoiceNumber,
        totalitem: itemCount,
        totalharga: totalHarga,
        pembayaran: bank,
        ongkir: ongkir,
        kurir: jenisKurir,
        totaltagihan: totalTagihan,
        itemCheckout,
        address,
      });

      itemCheckout.map((data) => {
        updateDoc(itemRef, {
          checkoutProduct: arrayRemove({
            id: data.id,
            category: data.category,
            img: data.img,
            nama: data.nama,
            tagline: data.tagline,
            harga: data.harga,
            qty: data.qty,
          }),
        });
      });

      itemCart.map((data) => {
        updateDoc(itemRef, {
          cartProduct: arrayRemove({
            id: data.id,
            category: data.category,
            img: data.img,
            nama: data.nama,
            tagline: data.tagline,
            harga: data.harga,
            qty: data.qty,
          }),
        });
      });
    }
    navigate(`../success/${unique_id}`);
  };

  const onUserBack = () => {
    if (user?.email) {
      itemCheckout.map((data) => {
        updateDoc(itemRef, {
          checkoutProduct: arrayRemove({
            id: data.id,
            category: data.category,
            img: data.img,
            nama: data.nama,
            tagline: data.tagline,
            harga: data.harga,
            qty: data.qty,
          }),
        });
      });
    }
  };

  const totalTagihan = parseInt(ongkir) + totalHarga;
  const itemCount = Array.isArray(itemCheckout) ? itemCheckout.length : null;
  const addressCount = Array.isArray(address) ? address.length : null;
  const userAddress = Array.isArray(address) ? address : null;

  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()} ${current.getHours()}:${current.getMinutes()} WIB`;

  let minNumber = 1000;
  let maxNumber = 9999;
  const invoiceNumber = Math.round(
    Math.random() * (maxNumber - minNumber) + minNumber
  );

  return (
    <React.Fragment>
      <AddressModal
        open={modalAddress}
        onClose={() => setModalAddress(false)}
      />

      <ModalEditAddress 
      open={modalEditAddress}
      onClose={() => setModalEditAddress(false)}
      address={userAddress}
      />

      {modalConfirmBack && (
        <BackPageModal
          onClose={() => setModalConfirmBack(false)}
          onOk={onUserBack}
        />
      )}

      <div className="Navigation">
        <img src={Logo} alt="LogoLalasia" />
      </div>

      <div className="checkOutContainer">
        <div className="checkoutWrap">
          <div className="alamatUser">
            <h3>Shipping address</h3>
            <hr className="itemLineBreak" />
            {addressCount === 0 ? (
              <div className="addressEmpty">
                <img src={addAddresImg} alt="addaddress" width={200} />
                <h4>It looks like your shipping address is empty</h4>
                <h4>Add Shipping Address To Continue</h4>
                <p onClick={() => setModalAddress(true)}>
                Add Shipping Address
                </p>
              </div>
            ) : Array.isArray(address) ? (
              address.slice(0, 1).map((data) => (
                <div className="dataAlamat" key={data.penerima}>
                  <h4>
                    {data.penerima} ( {data.label} )
                  </h4>
                  <p>{data.nomorhp}</p>
                  <p>
                    {data.alamat}, {data.kota}, {data.kodepos}
                  </p>
                  <a onClick={() => setModalEditAddress(true)} style={{cursor: "pointer"}}>Change Address</a>
                </div>
              ))
            ) : null}
            <hr className="itemLineBreak" />
          </div>

          <div className="itemCheckout">
            <h3>Item Checkout</h3>
            {Array.isArray(itemCheckout)
              ? itemCheckout.map((item) => (
                  <div className="checkoutItems" key={item.id}>
                    <img src={item.img} alt={item.nama} width={150} />
                    <div className="descItemCheckout">
                      <h3>{item.nama}</h3>
                      <p>{item.tagline}</p>
                      <h4>Rs. {numberWithCommas(item.harga)}</h4>
                      <p>{item.qty} Goods</p>
                    </div>
                  </div>
                ))
              : null}

            <div className="kurirPengiriman">
              <div className="selectKurir">
                <label>Select Delivery courier</label>
                <select
                  name="kurir"
                  /* value={ongkir} */
                  onChange={(e) => {
                    setOngkir(e.target.value);
                    setJenisKurir(
                      e.target.selectedOptions[0].getAttribute("kurir")
                    );
                  }}
                >
                  <option value="" selected disabled>
                  Select Courier
                  </option>
                  {kurir.map((data) => (
                    <option
                      value={data.ongkir}
                      kurir={data.jenis}
                      key={data.jenis}
                    >
                      {data.jenis} Rs.{numberWithCommas(data.ongkir)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p>Select Payment Method</p>
            <div className="metodePembayaran">
              <div className="bank">
                <div className="mandiri">
                  <img src={Mandiri} alt="mandiri" width={100} />
                  <label htmlFor="mandiri">Phonepe</label>
                  <input
                    type="radio"
                    id="mandiri"
                    name="contact"
                    value="Mandiri"
                    onChange={(e) => setBank(e.target.value)}
                  />
                </div>

                <div className="bca">
                  <img src={BCA} alt="bca" width={120} />
                  <label htmlFor="bca">Gpay</label>
                  <input
                    type="radio"
                    id="bca"
                    name="contact"
                    value="BCA"
                    onChange={(e) => setBank(e.target.value)}
                  />
                </div>

                <div className="bri">
                  <img src={BRI} alt="bri" width={150} />
                  <label htmlFor="bri">PayPal</label>
                  <input
                    type="radio"
                    id="bri"
                    name="contact"
                    value="BRI"
                    onChange={(e) => setBank(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ringkasanCheckout">
          <h3>Shopping Summary</h3>
          <div className="totalCheckout">
            <div className="totalBayarItem">
              <h4>Total price ( {itemCount} Goods )</h4>
              <h4>Rs. {numberWithCommas(totalHarga)}</h4>
            </div>
            <div className="totalBayarOngkir">
              <h4>Total Shipping Cost {jenisKurir}</h4>
              <h4>Rs. {numberWithCommas(ongkir)}</h4>
            </div>
            <div className="totalTagihan">
              <h4>Total bill</h4>
              <h4>Rs. {numberWithCommas(totalTagihan)}</h4>
            </div>
          </div>
          <div className="btnCheckout">
            {addressCount === 0 || bank === "" || ongkir === 0 ? (
              <button className="btnDisableCheckout">
                Complete the checkout procedure
              </button>
            ) : (
              <button
                type="button"
                className="btnBayar"
                onClick={checkoutDone}
              >
                Pay
              </button>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CheckOut;

