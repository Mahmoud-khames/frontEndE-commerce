import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"; 
import Link from "@/components/link";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import { LanguageType } from "@/i18n.config";

export default async function Footer() {
  const locale = await getCurrentLocale();  
  const { t } = await getTrans(locale as LanguageType);
  return (
    <footer className="bg-black text-white py-10 relative bottom-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.navigation.logo}</h3>
            <p className="mb-4">{t.general.subscribe}</p>
            <p className="mb-4">{t.general.getDiscount}</p>
            <div className="flex items-center border border-white rounded-md p-2">
              <input
                type="email"
                placeholder={t.general.enterEmail}
                className="bg-transparent text-white placeholder-white outline-none w-full"
              />
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.general.support}</h3>
            <p className="mb-2">
              {t.general.address}
            </p>
            <p
              className="mb-2 !text-wrap"
            >
              {t.general.email}
            </p>
            <p>{t.general.phone}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.general.account}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  {t.general.myAccount}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t.general.loginRegister}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t.navigation.cart}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t.navigation.wishlist}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t.general.shop}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.general.quickLink}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  {t.general.privacyPolicy}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t.general.termsOfUse}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t.general.faq}
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  {t.navigation.contact}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.general.downloadApp}</h3>
            <p className="mb-2">{t.general.saveWithApp}</p>
            <div className="flex space-x-2 mb-4">
              <div className="w-20 h-20 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600">{t.general.qrCode}</span>
              </div>
              <div className="flex flex-col space-y-2">
                <a href="#" className="block">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Google Play"
                    className="h-10"
                  />
                </a>
                <a href="#" className="block">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="App Store"
                    className="h-10"
                  />
                </a>
              </div>
            </div>

            <div className="flex space-x-8">
              <Link href="#">
                <Facebook className="w-6 h-6 hover:text-gray-300" />
              </Link>
              <Link href="#">
                <Twitter className="w-6 h-6 hover:text-gray-300" />
              </Link>
              <Link href="#">
                <Instagram className="w-6 h-6 hover:text-gray-300" />
              </Link>
              <Link href="#">
                <Linkedin className="w-6 h-6 hover:text-gray-300" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-4 text-center text-gray-400 text-sm">
          {t.general.copyright}
        </div>
      </div>
    </footer>
  );
}
