"use client";

import { useGeoLocation } from "@/hooks/geo/useGeoLocation";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import locationIcon from "@/assets/icons/location-icon.svg?url";

import "./GeoLocationSelector.scss";

const GeoLocationSelector = () => {
  const {
    inputVisible,
    inputValue,
    initialized,
    city,
    suggestions,
    hasUserTyped,
    iconStatus,
    wrapperRef,
    inputRef,
    t,
    setInputValue,
    setHasUserTyped,
    handleGeoIconClick,
    handleLabelClick,
    handleCloseInput,
    handleClearClick,
    handleSuggestionClick,
    handleKeyDown,
    getDisplayCity,
  } = useGeoLocation();

  const { determineGeo, changeCityGeo, enterCityGeo } = t.geo;

  return (
    <div
      className={`geo-selector ${inputVisible ? "input-visible" : ""}`}
      ref={wrapperRef}
    >
      <div className="geo-selector__container">
        {initialized && (
          <button
            className={`geo-selector__icon geo-selector__icon--${iconStatus}`}
            onClick={inputVisible ? handleCloseInput : handleGeoIconClick}
            title={iconStatus === "error" ? determineGeo : changeCityGeo}
          >
            <img src={locationIcon} alt="geo" width={16} height={16} />
          </button>
        )}

        <div
          className={`geo-selector__input-wrapper ${
            inputVisible ? "geo-selector__input-wrapper--visible" : ""
          }`}
        >
          <div className="geo-selector__input-inner">
            <input
              type="text"
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setHasUserTyped(true);
              }}
              onKeyDown={handleKeyDown}
              className="geo-selector__input"
              placeholder={enterCityGeo}
              autoFocus={inputVisible}
            />
            {inputVisible && (
              <CloseButton
                className="geo-selector__clear-btn"
                onClick={handleClearClick}
                width={10}
                height={10}
                title="Очистить"
              />
            )}
          </div>

          {hasUserTyped && inputValue.trim() && suggestions.length > 0 && (
            <ul className="geo-selector__suggestions">
              {suggestions.map((s) => (
                <li
                  key={s}
                  className="geo-selector__suggestion"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <span className="geo-selector__label" onClick={handleLabelClick}>
        {getDisplayCity(city)}
      </span>
    </div>
  );
};

export default GeoLocationSelector;
