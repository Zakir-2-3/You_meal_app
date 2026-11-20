const ProductPageSkeleton = () => (
  <div className="content-wrapper content-wrapper--skeleton" aria-hidden="true">
    <div className="product-section__img">
      <figure>
        <div className="product-gallery product-gallery--skeleton">
          <div className="sk-block sk-block--main-image" />
          <div className="product-gallery__thumbs">
            <div className="product-gallery__thumbs-container">
              <div className="sk-block sk-block--thumb" />
              <div className="sk-block sk-block--thumb" />
              <div className="sk-block sk-block--thumb" />
              <div className="sk-block sk-block--thumb" />
            </div>
          </div>
        </div>
      </figure>
    </div>

    <div className="product-section__info">
      <div className="sk-block sk-block--title" />
      <div className="sk-block sk-block--price" />
      <div className="sk-block sk-block--rating" />

      <div className="product-section__add-cart">
        <div className="sk-block sk-block--quantity" />
        <div className="sk-block sk-block--btn" />
      </div>

      <div className="sk-block sk-block--desc" />

      <div className="sk-block sk-block--table" />
    </div>
  </div>
);

export default ProductPageSkeleton;
