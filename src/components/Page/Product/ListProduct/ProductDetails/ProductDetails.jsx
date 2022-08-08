import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../../../../utils/databaseapi";
import { numberWithCommas } from "../../../../../utils/numberWithCommas";
import Skeleton from "react-loading-skeleton";
import axios from "axios";

import RelatedList from "./ProductRelated/RelatedList";
import Quantitiy from "./Quantitiy";

import "react-loading-skeleton/dist/skeleton.css";
import "../ProductDetails/ProductDetails.css";

const ReadMore = ({ children }) => {
  const text = children;
  const [isReadMore, setIsReadMore] = useState(true);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };
  if (text !== undefined && text !== null) {
    return (
      <React.Fragment>
        {isReadMore ? text.slice(0, 150) : text}
        <span onClick={toggleReadMore} className="read-or-hide">
          {isReadMore ? ".....Read more" : " Show less"}
        </span>
      </React.Fragment>
    );
  }
};

const ProductDetails = () => {
  const [product, setProduct] = useState([]);

  let { id } = useParams();

  useEffect(() => {
    axios.get(API_URL + `products/${id}`).then((res) => setProduct(res.data));
  }, []);

  return (
    <React.Fragment>
      <div className="productDetails">
        <img src={product.gambar} alt="productImage" />

        <div className="details">
          <h2>{product.nama || <Skeleton />}</h2>
          <h5>{product.tagline || <Skeleton count={5} />}</h5>
          <p>
            <ReadMore>{product.description}</ReadMore>
          </p>
          <h2>Rp.{numberWithCommas(product.harga) || <Skeleton />}</h2>

          <Quantitiy />

          <button className="btnBuy">Buy Now</button>
          <button className="btnAdd">Add To Cart</button>
        </div>
      </div>

      <RelatedList />
    </React.Fragment>
  );
};

export default ProductDetails;
