// components/Header/AnnouncementSlider.js
import React from 'react';

const AnnouncementSlider = ({ announcements }) => {
  return (
    <div className="announcement-slider swiper init-swiper">
      <div className="swiper-wrapper">
        {announcements.map((announcement, index) => (
          <div key={index} className="swiper-slide">
            {announcement}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementSlider;