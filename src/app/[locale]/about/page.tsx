import Image from "next/image";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";


import React from "react";
import { Facebook, Twitter, Linkedin, ShoppingBag, DollarSign, Briefcase, HandCoins } from "lucide-react"; // أيقونات السوشيال ميديا
import Link from "@/components/link";
import getTrans from "@/lib/translation";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { LanguageType } from "@/i18n.config";


export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const dictionary = await getDictionary(locale);
  
  return {
    title: dictionary.metadata.about.title,
    description: dictionary.metadata.about.description,
  };
}

export default async function About() {
  const locale = await getCurrentLocale();
  const { t } = await getTrans(locale as LanguageType);
  return (
    <div className="">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-600">
        <div className="flex justify-start items-start gap-2">
          <Link href={`/${locale}`} className="text-gray-600 hover:underline">
            {t.navigation.home}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/about`} className="text-black hover:underline">
            {t.navigation.about}
          </Link>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
          {/* content */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <h2 className="text-[54px] font-bold text-black">{t.about.ourStory}</h2>
            <p className="text-gray-600">
              {t.about.description}
            </p>
          
          </div>

          {/* img */}
          <div className="w-full lg:w-1/2">
            <Image
              src="/about.png"
              alt="about"
              width={707}
              height={600}
              className="w-full h-auto object-cover rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="flex flex-col items-center justify-center gap-4 shadow-sm p-6 rounded-md group hover:bg-secondary transition-all duration-300">
            <div className=" rounded-full w-20 h-20 flex items-center justify-center text-black  bg-gray-400/40 group-hover:bg-gray-100/20 group-hover:text-white">
              <div className="w-15 h-15 bg-black rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black">
                <ShoppingBag className="w-10 h-10 text-white group-hover:text-black" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 group-hover:text-white">
              <h3 className="text-3xl font-bold ">10.5K</h3>
              <p className="">{t.about.sellersActive}</p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center justify-center gap-4 shadow-sm p-6 rounded-md group hover:bg-secondary transition-all duration-300">
            <div className=" rounded-full w-20 h-20 flex items-center justify-center text-black  bg-gray-400/40 group-hover:bg-gray-100/20 group-hover:text-white">
              <div className="w-15 h-15 bg-black rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black">
                <DollarSign className="w-10 h-10 text-white group-hover:text-black" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 group-hover:text-white">
              <h3 className="text-3xl font-bold ">33k</h3>
              <p className="">{t.about.monthlyProductSale}</p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center justify-center gap-4 shadow-sm p-6 rounded-md group hover:bg-secondary transition-all duration-300">
            <div className=" rounded-full w-20 h-20 flex items-center justify-center text-black  bg-gray-400/40 group-hover:bg-gray-100/20 group-hover:text-white">
              <div className="w-15 h-15 bg-black rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black">
                <Briefcase className="w-10 h-10 text-white group-hover:text-black" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 group-hover:text-white">
              <h3 className="text-3xl font-bold ">45.5k</h3>
              <p className="">{t.about.customersActive}</p>
            </div>
          </div>
          {/* Stat 4 */}
          <div className="flex flex-col items-center justify-center gap-4 shadow-sm p-6 rounded-md group hover:bg-secondary transition-all duration-300">
            <div className=" rounded-full w-20 h-20 flex items-center justify-center text-black  bg-gray-400/40 group-hover:bg-gray-100/20 group-hover:text-white">
              <div className="w-15 h-15 bg-black rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black">
                <HandCoins className="w-10 h-10 text-white group-hover:text-black" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 group-hover:text-white">
              <h3 className="text-3xl font-bold ">25k</h3>
              <p className="">{t.about.annualGrossSale}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {/* Team Member 1 */}
          <div className="bg-white rounded-md  text-center h-[574px] border-0">
            <Image
              src="/team1.png"
              alt="Tom Cruise"
              width={370}
              height={430}
              className="w-full h-[430px] object-cover rounded-md mb-4"
            />
          <div className="flex flex-col items-start justify-start gap-2">
          <h3 className="text-xl font-semibold text-black not-[]:text-black">Tom Cruise</h3>
            <p className="text-gray-600">{t.about.founderChairman}</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#">
                <Twitter className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
              <a href="#">
                <Facebook className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
              <a href="#">
                <Linkedin className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
          </div>
            </div>
          </div>

            {/* Team Member 2 */}
            <div className="bg-white rounded-md  text-center h-[574px] border-0">
              <Image
              src="/team2.png"
              alt="Emma Watson"
              width={370}
              height={430}
              className="w-full h-[430px] rounded-md mb-4"
            />
            <div className="flex flex-col items-start justify-start gap-2"> 
            <h3 className="text-xl font-semibold text-black">Emma Watson</h3>

            <p className="text-gray-600">{t.about.managingDirector}</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#">
                <Twitter className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
              <a href="#">
                <Facebook className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
              <a href="#">
                <Linkedin className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
            </div>
            </div>
            </div>
            
          {/* Team Member 3 */}
            <div className="bg-white rounded-md  text-center h-[574px] border-0">
            <Image
              src="/team3.png"
              alt="Will Smith"
              width={370}
              height={430}
              className="w-full h-[430px] object-cover rounded-md mb-4"
              />
            <div className="flex flex-col items-start justify-start gap-2">
            <h3 className="text-xl font-semibold text-black">Will Smith</h3>
            <p className="text-gray-600">{t.about.productDesigner}</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#">
                <Twitter className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
              <a href="#">
                <Facebook className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
              <a href="#">
                <Linkedin className="w-6 h-6 text-gray-600 hover:text-black" />
              </a>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
