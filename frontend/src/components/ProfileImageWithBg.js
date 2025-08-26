import React, { useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa";

const ProfileImageWithBg = ({ imageUrl, size = 96 }) => {
  const [bgColor, setBgColor] = useState("#e5e7eb"); // default gray
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // allow pixel reading
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Sample top-left pixel (0,0)
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      setBgColor(`rgb(${r},${g},${b})`);
    };
  }, [imageUrl]);

  return (
    <div
      className="rounded-full flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
      }}
    >
      {imageUrl ? (
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Profile"
          className="w-full h-full object-contain"
        />
      ) : (
        <FaUser size={size / 2} className="text-gray-500" />
      )}
    </div>
  );
};

export default ProfileImageWithBg;
