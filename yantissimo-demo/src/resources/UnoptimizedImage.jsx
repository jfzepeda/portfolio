// eslint-plugin-custom/rules/no-img-without-unoptimized.js
import Image from "next/image";

const UnoptimizedImage = ({ alt = "", ...props }) => {
  return <Image alt={alt} {...props} unoptimized />;
};

export default UnoptimizedImage;
