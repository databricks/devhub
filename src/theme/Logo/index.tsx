import React, { type ReactNode } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useThemeConfig, type NavbarLogo } from "@docusaurus/theme-common";
import ThemedImage from "@theme/ThemedImage";
import type { Props } from "@theme/Logo";

function LogoThemedImage({
  logo,
  alt,
  imageClassName,
}: {
  logo: NavbarLogo;
  alt: string;
  imageClassName?: string;
}) {
  const lightSrc = useBaseUrl(logo.src);
  const darkSrc = useBaseUrl(logo.srcDark || logo.src);
  const sameSource = lightSrc === darkSrc;

  const image = sameSource ? (
    <img
      src={lightSrc}
      alt={alt}
      className={logo.className}
      height={logo.height}
      width={logo.width}
      style={logo.style}
    />
  ) : (
    <ThemedImage
      className={logo.className}
      sources={{ light: lightSrc, dark: darkSrc }}
      height={logo.height}
      width={logo.width}
      alt={alt}
      style={logo.style}
    />
  );

  return imageClassName ? <div className={imageClassName}>{image}</div> : image;
}

export function Logo(props: Props): ReactNode {
  const {
    siteConfig: { title },
  } = useDocusaurusContext();
  const {
    navbar: { title: navbarTitle, logo },
  } = useThemeConfig();

  const { imageClassName, titleClassName, ...propsRest } = props;
  const logoLink = useBaseUrl(logo?.href || "/");

  const fallbackAlt = navbarTitle ? "" : title;
  const alt = logo?.alt ?? fallbackAlt;

  return (
    <Link
      to={logoLink}
      {...propsRest}
      {...(logo?.target && { target: logo.target })}
    >
      {logo && (
        <LogoThemedImage
          logo={logo}
          alt={alt}
          imageClassName={imageClassName}
        />
      )}
      {navbarTitle != null && <b className={titleClassName}>{navbarTitle}</b>}
    </Link>
  );
}

export default Logo;
