import React from "react";
import { Phone, Mail } from "lucide-react"; // أيقونات من lucide-react
import Link from "@/components/link";
import { getCurrentLocale } from "@/lib/getCurrentLocale";  
import getTrans from "@/lib/translation";
import { LanguageType } from "@/i18n.config";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";


export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const dictionary = await getDictionary(locale);
  
  
  return {
    title: dictionary.metadata.contact.title,
    description: dictionary.metadata.contact.description,
  };
}

export default async function Contact() {
  const locale = await getCurrentLocale();
  const { t } = await getTrans(locale as LanguageType);
  return (
    <>
      <div className="flex justify-start items-start py-10 text-gray-600 gap-4">
        <Link href={`/${locale  }`} className="text-gray-600">
          {t.navigation.home}
        </Link>
        /
        <Link href={`/${locale}/contact`} className="text-black">
          {t.navigation.contact}
        </Link>
      </div>
      <div className="flex justify-start items-start min-h-screen  py-10">
        {/* route to contact */}

        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-8 shadow-md p-6 rounded-md  w-full md:w-1/3 h-[457px]">
              {/* Call To Us */}
              <div>
                <div className="flex items-center space-x-3">
                  <div className="bg-[#DB4444] p-2 rounded-full">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{t.contact.callToUs}</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  {t.contact.available}
                </p>
                <p className="mt-2 text-gray-600">{t.contact.phone2}</p>
              </div>

              {/* خط فاصل */}
              <div className="border-t border-gray-300"></div>

              {/* Write To Us */}
              <div>
                <div className="flex items-center space-x-3">
                  <div className="bg-[#DB4444] p-2 rounded-full">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{t.contact.writeToUs}</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  {t.contact.fillForm}
                </p>
                <p className="mt-2 text-gray-600">
                  {t.contact.emails}
                </p>
                <p className="text-gray-600">
                  {t.contact.support}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-md shadow-md w-full md:w-2/3 h-[457px]">
              <form className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
                  {/* Your Name */}
                  <div>
                    <input
                      type="text"
                      placeholder={t.contact.yourName}
                      className="w-full p-3 bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-[#DB4444] text-gray-600"
                      required
                    />
                  </div>

                  {/* Your Email */}
                  <div>
                    <input
                      type="email"
                      placeholder={t.contact.yourEmail}
                      className="w-full p-3 bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-[#DB4444] text-gray-600"
                      required
                    />
                  </div>

                  {/* Your Phone */}
                  <div>
                    <input
                      type="tel"
                      placeholder={t.contact.yourPhone}
                      className="w-full p-3 bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-[#DB4444] text-gray-600"
                      required
                    />
                  </div>
                </div>

                {/* Your Message */}
                <div>
                  <textarea
                    placeholder="Your Message"
                    className="w-full p-3 bg-gray-100 h-auto  md:h-[207px]  rounded-md outline-none focus:ring-2 focus:ring-[#DB4444] text-gray-600 h-32 resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#DB4444] text-white font-semibold py-4 px-12 rounded-md hover:bg-[#b03535] transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
